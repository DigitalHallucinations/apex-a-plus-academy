// Content now lives in JSON under ./content and is loaded at runtime (see
// ./content/index.ts and ./ContentContext.tsx). These re-exports preserve the
// bundled fallback bank for any non-React consumers (tests, scripts).
import { bundledContent } from "./content";

export const domains = bundledContent.domains;
export const questions = bundledContent.questions;
export const flashcards = bundledContent.flashcards;
