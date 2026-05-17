/** Preview sanitized filename for UI (backend also sanitizes). */
export function previewFilename(problemName: string): string {
  const lower = problemName.toLowerCase().trim();
  const tokens = lower.split(/\s+/).filter(Boolean);

  const firstWord = (tokens[0] ?? "")
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase();

  const number = tokens
    .map((t) => t.replace(/\D/g, ""))
    .find((d) => d.length > 0);

  if (firstWord && number) {
    return `${firstWord}_${number}.cpp`;
  }

  const sanitized = lower
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return `${sanitized || "untitled"}.cpp`;
}
