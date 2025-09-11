# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is `@takeshape/react-chat-agent`, a React library that provides AI chat components for integrating with TakeShape's chat agent platform. The library includes chat UI components, state management with Zustand, and bot protection features.

## Development Commands

- `npm run dev` - Start development server with example app
- `npm run build` - Build the library for production
- `npm run test` - Run linting, type checking, and tests
- `npm run ci` - Run tests in CI mode (vitest run)
- `npm run format` - Format code with Biome
- `npm run watch` - Run tests in watch mode
- `npm run clean` - Clean build artifacts

## Architecture

### Core Components
- **AiChatWidget** (`src/components/ai-chat/`): Main chat interface component with message history, input handling, and streaming responses
- **LLMOutput** (`src/llm-output/`): Renders AI responses with markdown support via `@llm-ui/react`
- **ChatBubble**: User message display component
- **Loading/ErrorMessage**: UI state components

### State Management
- **AiStore** (`src/stores/ai-store.tsx`): Main application state using Zustand including chat state, loading states, feedback, and bot protection tokens
- **TakeShapeClientStore** (`src/stores/takeshape-client-store.tsx`): TakeShape API client and connection management
- **useAiSession** (`src/hooks/use-ai-session.ts`): Session persistence with localStorage

### API Integration
- **useAi** (`src/hooks/use-ai.ts`): Core hook managing chat sessions, message sending, and polling for responses using native React state
- **TakeShapeClient** (`src/takeshape/client.ts`): GraphQL client for TakeShape platform
- **Queries** (`src/takeshape/queries.ts`): GraphQL operations for chat sessions and messages

### Bot Protection
The library integrates `@takeshape/use-cap` for proof-of-work based bot protection. Protection tokens are automatically generated and included with chat requests.

## Key Features

- **Streaming Chat**: Supports both immediate and polled responses from the TakeShape platform
- **Session Management**: Persistent chat sessions with localStorage backup
- **Markdown Rendering**: Rich text support in AI responses using `@llm-ui/markdown`
- **Error Handling**: Comprehensive error states and retry mechanisms
- **Bot Protection**: Automatic CAPTCHA/proof-of-work token generation
- **Feedback System**: Built-in message rating functionality

## Testing & Code Quality

- **Vitest** for unit testing with jsdom environment
- **Biome** for linting and formatting (configured in `biome.json`)
- **TypeScript** with strict configuration
- Uses React Testing Library for component tests

## Dependencies

This library minimizes external dependencies for better standalone usage:
- **Core React hooks** for state management instead of external libraries
- **Zustand** for minimal global state management
- **@llm-ui/react** for markdown rendering in chat responses
- **@takeshape/use-cap** for bot protection

## Build Configuration

The project builds as an ES module library using Vite with the following externals: `react`, `react-dom`, `react/jsx-runtime`. Output includes both JS and TypeScript declarations.