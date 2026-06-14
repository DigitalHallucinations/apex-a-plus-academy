import { createContext, useContext } from "react";
import { bundledContent, type ContentBundle } from "./content";

const ContentContext = createContext<ContentBundle>(bundledContent);

export const ContentProvider = ContentContext.Provider;

/** Access the active content bank (domains, questions, flashcards). */
export function useContent(): ContentBundle {
  return useContext(ContentContext);
}
