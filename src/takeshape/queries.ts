export const CREATE_CHAT_SESSION = `#graphql
  mutation createChatSession {
    createChatSession {
      id
    }
  }
`;

export const SEND_CHAT_MESSAGE = `#graphql
  mutation sendChatMessage(
    $input: String!
    $sessionId: String!
    $token: String!
  ) {
    sendChatMessage(
      input: $input
      sessionId: $sessionId
      runMode: ALLOW_BACKGROUND
      token: $token
    ) {
      messageId
      session {
        id
        sessionMemory
      }
      output {
        content
        references {
          _tid
        }
      }
    }
  }
`;

export const GET_CHAT_MESSAGE = `#graphql
  query getChatMessage($messageId: String!) {
    getChatMessage(messageId: $messageId) {
      error {
        message
      }
      session {
        sessionMemory
      }
      output {
        content
        references {
          _tid
        }
      }
      status
    }
  }
`;

export const FEEDBACK_MUTATION = `#graphql
  mutation ($messageId: String!, $name: String!, $label: String, $note: String, $updatedBy: String, $createdAt: Float) {
    sendChatFeedback(messageId: $messageId, name: $name, label: $label, note: $note, updatedBy: $updatedBy, createdAt: $createdAt)
  }
`;
