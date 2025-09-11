import type { MouseEventHandler, ReactNode } from 'react';
import { Component } from 'react';
import { ErrorMessage } from './error-message.tsx';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  retry: MouseEventHandler;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
    this.retry = (event) => {
      event.preventDefault();
      this.setState({ hasError: false, error: null });
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <ErrorMessage retry={this.retry}>Something went wrong.</ErrorMessage>
      );
    }

    return this.props.children;
  }
}
