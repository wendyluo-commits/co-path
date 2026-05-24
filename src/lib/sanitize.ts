// Defenses against common prompt-injection vectors in user-supplied strings
// that get interpolated into the LLM prompt.
//
// We don't try to detect malicious intent (impossible). We just strip the
// markdown / control-token tricks that let attackers escape the prompt's
// section markers.

const DEFAULT_MAX_LENGTH = 500;

export function sanitizeForPrompt(input: string, maxLength: number = DEFAULT_MAX_LENGTH): string {
  let s = input.normalize('NFKC');

  // Strip ASCII control chars except space. Keeps tab/newline OUT —
  // attackers use them to fake new prompt sections.
  s = s.replace(/[\x00-\x1F\x7F]/g, ' ');

  // Drop triple backticks / tildes (markdown code fences).
  s = s.replace(/`{3,}/g, '').replace(/~{3,}/g, '');

  // Neutralize literal "## " headings that mimic our section markers.
  s = s.replace(/^\s*#{1,6}\s+/gm, '');

  // Collapse whitespace and trim.
  s = s.replace(/\s+/g, ' ').trim();

  if (s.length > maxLength) {
    s = s.slice(0, maxLength);
  }

  return s;
}

// Backward-compatible alias — keeps `sanitizeQuestion` working for callers
// that don't need the maxLength knob.
export function sanitizeQuestion(input: string): string {
  return sanitizeForPrompt(input);
}
