import type { Domain, Flashcard, Pbq, Question } from "../types";

export interface ContentBundle {
  domains: Domain[];
  questions: Question[];
  flashcards: Flashcard[];
  pbqs: Pbq[];
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

  const { domains, questions, flashcards, pbqs } = content;
  if (!Array.isArray(domains) || domains.length === 0) errors.push("domains must be a non-empty array");
  if (!Array.isArray(questions) || questions.length === 0) errors.push("questions must be a non-empty array");
  if (!Array.isArray(flashcards) || flashcards.length === 0) errors.push("flashcards must be a non-empty array");
  if (pbqs !== undefined && !Array.isArray(pbqs)) errors.push("pbqs must be an array when present");
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

  const seenP = new Set<string>();
  for (const p of (pbqs ?? []) as Pbq[]) {
    if (seenP.has(p.id)) errors.push(`Duplicate PBQ id: ${p.id}`);
    seenP.add(p.id);
    if (!domainIds.has(p.domain)) errors.push(`PBQ ${p.id}: unknown domain "${p.domain}"`);
    if (!EXAM_CODES.includes(p.exam)) errors.push(`PBQ ${p.id}: invalid exam "${p.exam}"`);
    if (!p.prompt?.trim()) errors.push(`PBQ ${p.id}: empty prompt`);
    if (!p.explanation?.trim()) errors.push(`PBQ ${p.id}: empty explanation`);
    if (p.kind === "matching") {
      const itemIds = new Set(p.items?.map(i => i.id));
      const targetIds = new Set(p.targets?.map(t => t.id));
      if (!p.items?.length || !p.targets?.length) errors.push(`PBQ ${p.id}: matching needs items and targets`);
      for (const id of itemIds) if (!(id in (p.answer || {}))) errors.push(`PBQ ${p.id}: item "${id}" has no answer`);
      for (const [item, target] of Object.entries(p.answer || {})) {
        if (!itemIds.has(item)) errors.push(`PBQ ${p.id}: answer references unknown item "${item}"`);
        if (!targetIds.has(target)) errors.push(`PBQ ${p.id}: answer references unknown target "${target}"`);
      }
    } else if (p.kind === "ordering") {
      const stepIds = new Set(p.steps?.map(s => s.id));
      if (!p.steps?.length) errors.push(`PBQ ${p.id}: ordering needs steps`);
      if (p.answer?.length !== p.steps?.length) errors.push(`PBQ ${p.id}: answer length must match steps`);
      for (const id of p.answer || []) if (!stepIds.has(id)) errors.push(`PBQ ${p.id}: answer references unknown step "${id}"`);
    } else {
      const bad = p as { id: string; kind?: string };
      errors.push(`PBQ ${bad.id}: unknown kind "${bad.kind}"`);
    }
  }

  return errors;
}
