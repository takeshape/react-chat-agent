export interface AiChatTheme {
  /** Widget container colors */
  widget?: {
    /** Background color of the widget container (default: white) */
    backgroundColor?: string;
    /** Border color of the widget container (default: black) */
    borderColor?: string;
  };

  /** Header colors */
  header?: {
    /** Background color of the header (default: #1e40af - blue-800) */
    backgroundColor?: string;
    /** Text color in the header (default: white) */
    textColor?: string;
    /** Hover text color for header buttons (default: inherit with underline) */
    buttonHoverColor?: string;
  };

  /** Chat bubble colors for user messages */
  userBubble?: {
    /** Background color of user message bubbles (default: #1d4ed8 - blue-700) */
    backgroundColor?: string;
    /** Text color in user message bubbles (default: white) */
    textColor?: string;
  };

  /** Input field colors */
  input?: {
    /** Border color of the input field (default: #6b7280 - gray-500) */
    borderColor?: string;
    /** Background color of the input field (default: white) */
    backgroundColor?: string;
    /** Text color in the input field (default: inherit) */
    textColor?: string;
    /** Placeholder text color (default: inherit) */
    placeholderColor?: string;
  };

  /** Send button colors */
  sendButton?: {
    /** Icon stroke color (default: #525252 - neutral-600) */
    iconColor?: string;
    /** Icon stroke color on hover (default: inherit) */
    iconHoverColor?: string;
  };

  /** Toggle button colors (when chat is closed) */
  toggleButton?: {
    /** Background color of the toggle button (default: white) */
    backgroundColor?: string;
    /** Text color of the toggle button (default: black) */
    textColor?: string;
    /** Border color of the toggle button (default: black) */
    borderColor?: string;
    /** Hover background color (default: inherit) */
    hoverBackgroundColor?: string;
  };
}

/** Default theme values matching current Tailwind classes */
export const defaultTheme: Required<AiChatTheme> = {
  widget: {
    backgroundColor: '#ffffff',
    borderColor: '#000000'
  },
  header: {
    backgroundColor: '#1e40af',
    textColor: '#ffffff',
    buttonHoverColor: '#ffffff'
  },
  userBubble: {
    backgroundColor: '#1d4ed8',
    textColor: '#ffffff'
  },
  input: {
    borderColor: '#6b7280',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    placeholderColor: '#9ca3af'
  },
  sendButton: {
    iconColor: '#525252',
    iconHoverColor: '#525252'
  },
  toggleButton: {
    backgroundColor: '#ffffff',
    textColor: '#000000',
    borderColor: '#000000',
    hoverBackgroundColor: '#f9fafb'
  }
};

/** Utility function to merge user theme with defaults */
export function mergeTheme(userTheme?: AiChatTheme): Required<AiChatTheme> {
  if (!userTheme) return defaultTheme;

  return {
    widget: {
      ...defaultTheme.widget,
      ...userTheme.widget
    },
    header: {
      ...defaultTheme.header,
      ...userTheme.header
    },
    userBubble: {
      ...defaultTheme.userBubble,
      ...userTheme.userBubble
    },
    input: {
      ...defaultTheme.input,
      ...userTheme.input
    },
    sendButton: {
      ...defaultTheme.sendButton,
      ...userTheme.sendButton
    },
    toggleButton: {
      ...defaultTheme.toggleButton,
      ...userTheme.toggleButton
    }
  };
}
