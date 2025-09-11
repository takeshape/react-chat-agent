# @takeshape/react-chat-agent

A React library providing AI chat components for integrating with TakeShape's chat agent platform. Features streaming chat responses, session management, markdown rendering, and bot protection.

## Installation

```bash
npm install @takeshape/react-chat-agent
```

## Quick Start

```tsx
import { AiChatWidget } from '@takeshape/react-chat-agent';

function App() {
  return (
    <AiChatWidget
      endpoint="https://api.takeshape.io/project/<your-project-id>/production/graphql"
      apiKey="your-api-key"
      welcomeMessage="Welcome! How can I help you today?"
      suggestions={[
        'Tell me about your products',
        'How can I get started?',
        'What services do you offer?'
      ]}
    />
  );
}
```

## AiChatWidget

The main component that provides a complete chat interface with a toggleable widget design.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `endpoint` | `string` | ✅ | TakeShape GraphQL endpoint URL |
| `apiKey` | `string` | ✅ | TakeShape API key for authentication |
| `email` | `string` | ❌ | User email for feedback attribution |
| `welcomeMessage` | `string` | ❌ | Initial message displayed when chat opens |
| `suggestions` | `string[]` | ❌ | Pre-defined message suggestions shown when chat is empty |

### Features

- **Fixed Position Widget**: Renders as a fixed-position button that expands into a chat interface
- **Session Management**: Automatically manages chat sessions with localStorage persistence
- **Streaming Responses**: Real-time AI response streaming with typing indicators
- **Markdown Support**: Rich text rendering in AI responses using `@llm-ui/markdown`
- **Message Feedback**: Built-in thumbs up/down feedback system for AI responses
- **Bot Protection**: Automatic CAPTCHA/proof-of-work token generation via `@takeshape/use-cap`
- **Error Handling**: Comprehensive error states with retry functionality
- **Responsive Design**: Optimized for various screen sizes

### Styling

The component uses Tailwind CSS.

### Usage Examples

#### Basic Usage
```tsx
<AiChatWidget
  endpoint="https://api.takeshape.io/project/<your-project-id>/production/graphql"
  apiKey="your-api-key"
/>
```

#### With Welcome Message and Suggestions
```tsx
<AiChatWidget
  endpoint="https://api.takeshape.io/project/<your-project-id>/production/graphql"
  apiKey="your-api-key"
  welcomeMessage="Welcome! I can help you find products for your vehicle. Just tell me what you need!"
  suggestions={[
    'Help me find engine oil',
    'I need new brake pads',
    'Show me air filters',
    'Looking for spark plugs'
  ]}
/>
```

#### With User Email for Feedback
```tsx
<AiChatWidget
  endpoint="https://api.takeshape.io/project/<your-project-id>/production/graphql"
  apiKey="your-api-key"
  email="user@example.com"
  welcomeMessage="Hello! How can I assist you today?"
/>
```

### Architecture

The `AiChatWidget` consists of several key components:

- **Chat Interface**: Main chat UI with message history and input form
- **State Management**: Zustand-based stores for chat state and TakeShape client
- **Session Persistence**: Automatic session saving/loading with localStorage
- **Bot Protection**: Integrated proof-of-work token generation
- **Error Boundaries**: React error boundaries for graceful error handling
- **Feedback System**: Modal-based feedback collection for AI responses

### API Integration

The component integrates with TakeShape's GraphQL API for:
- Creating and managing chat sessions
- Sending messages and receiving AI responses
- Polling for streaming response updates
- Submitting message feedback

### Error Handling

The component handles various error states:
- Network connection errors
- API authentication errors  
- Malformed responses
- Session creation failures

All errors display user-friendly messages with retry functionality.

## Development

See the `example/` directory for a complete implementation example.
