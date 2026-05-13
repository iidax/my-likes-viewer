export function detectStatusFromText(fullText: string): "suspended" | null {
  if (fullText.includes("{learnmore}")) return "suspended";
  return null;
}
