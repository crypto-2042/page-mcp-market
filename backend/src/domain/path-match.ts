export function isValidRegexPattern(pattern: string): boolean {
  if (!pattern.trim()) return false;
  try {
    new RegExp(pattern);
    return true;
  } catch {
    return false;
  }
}

export function matchesPath(pathPattern: string, path: string): boolean {
  try {
    return new RegExp(pathPattern).test(path);
  } catch {
    return false;
  }
}
