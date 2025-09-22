function upperFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getCreateSessionName(agentName: string): string {
  return `create${upperFirst(agentName)}Session`;
}

export function getSendMessageName(inputName: string): string {
  return `send${upperFirst(inputName)}Message`;
}

export function getGetMessageName(inputName: string): string {
  return `get${upperFirst(inputName)}Message`;
}

export function getSendFeedbackName(agentName: string): string {
  return `send${upperFirst(agentName)}Feedback`;
}
