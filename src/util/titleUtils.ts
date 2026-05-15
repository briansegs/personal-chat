const DEFAULT_TITLE = "New Chat";

export function isDefaultTitle(title?: string) {
  return !title || title === DEFAULT_TITLE;
}

export function generateSessionTitle(content: string) {
  const cleaned = content.replace(/[?.!]/g, "").trim();

  if (cleaned.length <= 25) {
    return cleaned;
  }

  return `${cleaned.slice(0, 25).trim()}...`;
}

export { DEFAULT_TITLE };
