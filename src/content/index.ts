import { invoke } from "@tauri-apps/api/core";
import type { Domain, Flashcard, Question } from "../types";
import { validateContent, type ContentBundle } from "./validate";
import domainsJson from "./domains.json";
import questionsJson from "./questions.json";
import flashcardsJson from "./flashcards.json";

export type { ContentBundle } from "./validate";

/**
 * Bundled content shipped with the app. Acts as the offline fallback and as
 * the source consumed by tests and the validation script.
 */
export const bundledContent: ContentBundle = {
  domains: domainsJson as Domain[],
  questions: questionsJson as Question[],
  flashcards: flashcardsJson as Flashcard[]
};

function isTauri() {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

/**
 * Loads the active content bundle. On the desktop build it prefers content
 * read by the Rust backend from bundled resource files, which lets the
 * question/flashcard banks be updated without rebuilding the app. Any failure
 * or malformed payload falls back to the bundled content so the app always
 * starts with a valid bank.
 */
export async function loadContent(): Promise<ContentBundle> {
  if (!isTauri()) return bundledContent;
  try {
    const remote = await invoke<Partial<ContentBundle>>("load_content");
    const errors = validateContent(remote);
    if (errors.length) {
      console.warn("Backend content failed validation; using bundled content.", errors);
      return bundledContent;
    }
    return remote as ContentBundle;
  } catch (err) {
    console.warn("Could not load backend content; using bundled content.", err);
    return bundledContent;
  }
}
