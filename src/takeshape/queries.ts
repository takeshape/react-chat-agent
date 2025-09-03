export const CREATE_CHAT_SESSION = `#graphql
  mutation createChatAgentSession {
    createChatAgentSession {
      id
    }
  }
`;

export const SEND_CHAT_AGENT_MESSAGE = `#graphql
  mutation sendChatAgentMessage(
    $input: String!
    $sessionId: String!
    $typeId: Int
    $typeName: String
    $token: String!
  ) {
    sendChatAgentMessage(
      input: $input
      sessionId: $sessionId
      typeId: $typeId
      typeName: $typeName
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

export const GET_CHAT_AGENT_MESSAGE = `#graphql
  query getChatAgentMessage($messageId: String!) {
    getChatAgentMessage(messageId: $messageId) {
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
    sendChatAgentFeedback(messageId: $messageId, name: $name, label: $label, note: $note, updatedBy: $updatedBy, createdAt: $createdAt)
  }
`;
