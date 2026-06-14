#!/usr/bin/env node
// Validates the JSON content banks before they ship. Run with:
//   npm run validate:content
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const contentDir = join(here, "..", "src", "content");
const read = name => JSON.parse(readFileSync(join(contentDir, `${name}.json`), "utf8"));
const readOptional = name => { try { return read(name); } catch { return []; } };

const EXAM_CODES = ["220-1201", "220-1202"];
const DIFFICULTIES = ["Foundation", "Intermediate", "Advanced"];

function validate(domains, questions, flashcards, pbqs) {
  const errors = [];
  const domainIds = new Set(domains.map(d => d.id));

  const seenD = new Set();
  for (const d of domains) {
    if (seenD.has(d.id)) errors.push(`Duplicate domain id: ${d.id}`);
    seenD.add(d.id);
    if (!EXAM_CODES.includes(d.exam)) errors.push(`Domain ${d.id}: invalid exam "${d.exam}"`);
  }

  const seenQ = new Set();
  for (const q of questions) {
    if (seenQ.has(q.id)) errors.push(`Duplicate question id: ${q.id}`);
    seenQ.add(q.id);
    if (!domainIds.has(q.domain)) errors.push(`Question ${q.id}: unknown domain "${q.domain}"`);
    if (!EXAM_CODES.includes(q.exam)) errors.push(`Question ${q.id}: invalid exam "${q.exam}"`);
    if (!DIFFICULTIES.includes(q.difficulty)) errors.push(`Question ${q.id}: invalid difficulty "${q.difficulty}"`);
    if (!Array.isArray(q.options) || q.options.length < 2) errors.push(`Question ${q.id}: needs >= 2 options`);
    else if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length)
      errors.push(`Question ${q.id}: answer index ${q.answer} out of range`);
    for (const field of ["prompt", "explanation", "objective"])
      if (!q[field]?.trim()) errors.push(`Question ${q.id}: empty ${field}`);
  }

  const seenF = new Set();
  for (const f of flashcards) {
    if (seenF.has(f.id)) errors.push(`Duplicate flashcard id: ${f.id}`);
    seenF.add(f.id);
    if (!domainIds.has(f.domain)) errors.push(`Flashcard ${f.id}: unknown domain "${f.domain}"`);
    for (const field of ["front", "back"])
      if (!f[field]?.trim()) errors.push(`Flashcard ${f.id}: empty ${field}`);
  }

  const seenP = new Set();
  for (const p of pbqs) {
    if (seenP.has(p.id)) errors.push(`Duplicate PBQ id: ${p.id}`);
    seenP.add(p.id);
    if (!domainIds.has(p.domain)) errors.push(`PBQ ${p.id}: unknown domain "${p.domain}"`);
    if (!EXAM_CODES.includes(p.exam)) errors.push(`PBQ ${p.id}: invalid exam "${p.exam}"`);
    if (p.kind === "matching") {
      const itemIds = new Set((p.items || []).map(i => i.id));
      const targetIds = new Set((p.targets || []).map(t => t.id));
      if (!(p.items || []).length || !(p.targets || []).length) errors.push(`PBQ ${p.id}: matching needs items and targets`);
      for (const id of itemIds) if (!(id in (p.answer || {}))) errors.push(`PBQ ${p.id}: item "${id}" has no answer`);
      for (const [item, target] of Object.entries(p.answer || {})) {
        if (!itemIds.has(item)) errors.push(`PBQ ${p.id}: answer references unknown item "${item}"`);
        if (!targetIds.has(target)) errors.push(`PBQ ${p.id}: answer references unknown target "${target}"`);
      }
    } else if (p.kind === "ordering") {
      const stepIds = new Set((p.steps || []).map(s => s.id));
      if ((p.answer || []).length !== (p.steps || []).length) errors.push(`PBQ ${p.id}: answer length must match steps`);
      for (const id of p.answer || []) if (!stepIds.has(id)) errors.push(`PBQ ${p.id}: answer references unknown step "${id}"`);
    } else {
      errors.push(`PBQ ${p.id}: unknown kind "${p.kind}"`);
    }
  }
  return errors;
}

const domains = read("domains");
const questions = read("questions");
const flashcards = read("flashcards");
const pbqs = readOptional("pbqs");
const errors = validate(domains, questions, flashcards, pbqs);

if (errors.length) {
  console.error(`✗ Content validation failed (${errors.length} issue(s)):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

const perDomain = domains
  .map(d => `${d.id}:${questions.filter(q => q.domain === d.id).length}`)
  .join("  ");
console.log(`✓ Content valid: ${domains.length} domains, ${questions.length} questions, ${flashcards.length} flashcards, ${pbqs.length} PBQs`);
console.log(`  questions per domain -> ${perDomain}`);
