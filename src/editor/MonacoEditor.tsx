import { useRef, useCallback, useState, useEffect } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { useTranslation } from "react-i18next";
import { useEditorStore } from "./editorStore";
import { useEditorRefStore } from "./editorRefStore";
import { registerSnippets } from "@/snippets/registerSnippets";
import { registerFormatter } from "./cppFormatter";
import { useEditorShortcuts } from "./useEditorShortcuts";
import { useCompileRun } from "@/compiler/useCompileRun";

import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";

self.MonacoEnvironment = {
  getWorker() {
    return new editorWorker();
  },
};

function detectLanguage(filePath: string | null): string {
  if (!filePath) return "cpp";
  const ext = filePath.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "md") return "markdown";
  return "cpp";
}

export function MonacoEditor() {
  const { t } = useTranslation();
  const content = useEditorStore((s) => s.content);
  const filePath = useEditorStore((s) => s.filePath);
  const setContent = useEditorStore((s) => s.setContent);
  const setEditorRef = useEditorRefStore((s) => s.setEditorRef);
  const [editorInstance, setEditorInstance] =
    useState<editor.IStandaloneCodeEditor | null>(null);
  const disposeSnippets = useRef<(() => void) | null>(null);
  const disposeFormatter = useRef<(() => void) | null>(null);
  const { run } = useCompileRun();
  const language = detectLanguage(filePath);

  useEditorShortcuts(editorInstance, { onRun: run });

  const handleMount: OnMount = useCallback((ed, monaco) => {
    setEditorInstance(ed);
    setEditorRef(ed);
    disposeSnippets.current?.();
    disposeSnippets.current = registerSnippets(monaco);
    disposeFormatter.current?.();
    disposeFormatter.current = registerFormatter(monaco);
    ed.focus();
  }, [setEditorRef]);

  useEffect(() => {
    return () => {
      disposeSnippets.current?.();
      disposeFormatter.current?.();
    };
  }, []);


  if (!filePath) {
    return (
      <div className="flex flex-1 items-center justify-center text-[var(--text-muted)] select-none">
        {t("editor.placeholder")}
      </div>
    );
  }

  return (
    <div className="flex flex-1 min-h-0 min-w-0">
      <Editor
        height="100%"
        language={language}
        theme="vs-dark"
        value={content}
        onChange={(value) => setContent(value ?? "")}
        onMount={handleMount}
        options={{
          fontSize: 14,
          fontFamily: "Consolas, 'Courier New', monospace",
          minimap: { enabled: false },
          wordWrap: "off",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 4,
          insertSpaces: false,
          renderLineHighlight: "line",
          padding: { top: 8 },
          smoothScrolling: true,
          cursorBlinking: "smooth",
          bracketPairColorization: { enabled: true },
        }}
      />
    </div>
  );
}
