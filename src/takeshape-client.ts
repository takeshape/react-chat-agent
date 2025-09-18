import type { GraphQLError } from 'graphql/error';

interface GraphQLResponse<T = unknown> {
  data?: T;
  errors?: GraphQLError[];
}

export async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function createTakeShapeClient(endpoint: string, apiKey: string) {
  const sendRequest = async (
    queryStr: string,
    variables?: Record<string, unknown> | null,
    usePersistedQuery?: boolean
  ): Promise<any> => {
    const hash = await sha256(queryStr);
    const extensionsObj = {
      persistedQuery: {
        version: 1,
        sha256Hash: hash
      }
    };
    let result: GraphQLResponse<unknown> | undefined;

    let endpointWithExtensions = endpoint;
    // Use persisted query if possible
    if (usePersistedQuery) {
      const persistedQueryParams = new URLSearchParams();
      persistedQueryParams.append('extensions', JSON.stringify(extensionsObj));
      if (variables) {
        persistedQueryParams.append('variables', JSON.stringify(variables));
      }
      endpointWithExtensions = `${endpoint}?${persistedQueryParams}`;
      const persistedQueryResult = await fetch(endpointWithExtensions, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`
        }
      });

      const persistedQueryResultJson =
        (await persistedQueryResult.json()) as GraphQLResponse;

      if (persistedQueryResultJson.errors) {
        if (
          persistedQueryResultJson.errors.length === 1 &&
          persistedQueryResultJson.errors[0]?.extensions?.code ===
            'PERSISTED_QUERY_NOT_FOUND'
        ) {
          // Persisted query not found, continue and use POST
        } else if (process.env.NODE_ENV === 'development') {
          console.error(
            'Unexpected query error',
            queryStr,
            JSON.stringify(persistedQueryResultJson.errors, null, 2)
          );
        }
      } else {
        result = persistedQueryResultJson;
      }
    }

    if (!result) {
      const postResult = await fetch(endpointWithExtensions, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          query: queryStr,
          variables,
          extensions: usePersistedQuery ? extensionsObj : undefined
        })
      });

      result = (await postResult.json()) as GraphQLResponse<unknown>;
    }

    if (result.errors && result.errors?.length > 0) {
      throw new Error(result.errors[0]?.message);
    }

    return result.data;
  };

  const query = (
    query: string,
    params?: { variables?: Record<string, unknown> },
    usePersistedQuery = true
  ) => sendRequest(query, params?.variables, usePersistedQuery);
  const mutation = async (
    query: string,
    params?: { variables?: Record<string, unknown> }
  ) => sendRequest(query, params?.variables, false);

  return {
    query,
    mutation
  };
}

export type TakeShapeClient = ReturnType<typeof createTakeShapeClient>;

export type TakeShapeConnectionDetails = {
  endpoint: string;
  apiKey: string;
  email?: string;
};
