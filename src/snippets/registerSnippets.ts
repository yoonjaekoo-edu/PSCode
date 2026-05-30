import type { Monaco } from "@monaco-editor/react";
import type * as monacoEditor from "monaco-editor";
import { CPP_SNIPPETS } from "./cppSnippets";
import { useSettingsStore } from "../settings/settingsStore";

export function registerSnippets(monaco: Monaco): () => void {
  const provider = monaco.languages.registerCompletionItemProvider("cpp", {
    triggerCharacters: ["#", ".", ":", "a", "b", "c", "d", "e", "f", "g", "h", "i", "l", "m", "p", "q", "r", "s", "u", "v", "w"],
    provideCompletionItems: (
      model: monacoEditor.editor.ITextModel,
      position: monacoEditor.Position,
    ) => {
      const word = model.getWordUntilPosition(position);
      const range: monacoEditor.IRange = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const { enabledSnippets, snippetsEnabled } = useSettingsStore.getState();
      // If global snippets toggle is off, return empty suggestions
      if (!snippetsEnabled) {
        return { suggestions: [] };
      }

      const suggestions = CPP_SNIPPETS.filter((snippet) => {
        // If a specific override exists, respect it; otherwise default to true
        if (enabledSnippets && Object.prototype.hasOwnProperty.call(enabledSnippets, snippet.label)) {
          return enabledSnippets[snippet.label];
        }
        return true;
      }).map((snippet) => ({
        label: snippet.label,
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: snippet.insertText,
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        detail: snippet.detail,
        range,
        sortText: "0" + snippet.label,
      }));

      return { suggestions };
    },
  });

  return () => provider.dispose();
}
