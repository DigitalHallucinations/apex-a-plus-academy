import type { Domain, Flashcard, Question } from "../types";

export interface ContentBundle {
  domains: Domain[];
  questions: Question[];
  flashcards: Flashcard[];
}

const EXAM_CODES = ["220-1201", "220-1202"];
const DIFFICULTIES = ["Foundation", "Intermediate", "Advanced"];

/**
 * Validates a content bundle and returns a list of human-readable errors.
 * An empty array means the content is structurally sound. Shared by the
 * runtime loader (to reject malformed backend content) and the
 * `validate:content` authoring script.
 */
export function validateContent(content: Partial<ContentBundle> | null | undefined): string[] {
  const errors: string[] = [];
  if (!content || typeof content !== "object") return ["Content is not an object"];

  const { domains, questions, flashcards } = content;
  if (!Array.isArray(domains) || domains.length === 0) errors.push("domains must be a non-empty array");
  if (!Array.isArray(questions) || questions.length === 0) errors.push("questions must be a non-empty array");
  if (!Array.isArray(flashcards) || flashcards.length === 0) errors.push("flashcards must be a non-empty array");
  if (errors.length) return errors;

  const domainIds = new Set((domains as Domain[]).map(d => d.id));
  const seenDomain = new Set<string>();
  for (const d of domains as Domain[]) {
    if (seenDomain.has(d.id)) errors.push(`Duplicate domain id: ${d.id}`);
    seenDomain.add(d.id);
    if (!EXAM_CODES.includes(d.exam)) errors.push(`Domain ${d.id}: invalid exam "${d.exam}"`);
  }

  const seenQ = new Set<string>();
  for (const q of questions as Question[]) {
    if (seenQ.has(q.id)) errors.push(`Duplicate question id: ${q.id}`);
    seenQ.add(q.id);
    if (!domainIds.has(q.domain)) errors.push(`Question ${q.id}: unknown domain "${q.domain}"`);
    if (!EXAM_CODES.includes(q.exam)) errors.push(`Question ${q.id}: invalid exam "${q.exam}"`);
    if (!DIFFICULTIES.includes(q.difficulty)) errors.push(`Question ${q.id}: invalid difficulty "${q.difficulty}"`);
    if (!Array.isArray(q.options) || q.options.length < 2) errors.push(`Question ${q.id}: needs at least 2 options`);
    else if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length)
      errors.push(`Question ${q.id}: answer index ${q.answer} is out of range`);
    if (!q.prompt?.trim()) errors.push(`Question ${q.id}: empty prompt`);
    if (!q.explanation?.trim()) errors.push(`Question ${q.id}: empty explanation`);
    if (!q.objective?.trim()) errors.push(`Question ${q.id}: empty objective`);
  }

  const seenF = new Set<string>();
  for (const f of flashcards as Flashcard[]) {
    if (seenF.has(f.id)) errors.push(`Duplicate flashcard id: ${f.id}`);
    seenF.add(f.id);
    if (!domainIds.has(f.domain)) errors.push(`Flashcard ${f.id}: unknown domain "${f.domain}"`);
    if (!f.front?.trim()) errors.push(`Flashcard ${f.id}: empty front`);
    if (!f.back?.trim()) errors.push(`Flashcard ${f.id}: empty back`);
  }

  return errors;
}
