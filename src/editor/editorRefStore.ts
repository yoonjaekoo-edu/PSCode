import { type editor } from "monaco-editor";
import { create } from "zustand";

interface EditorRefState {
  editorRef: editor.IStandaloneCodeEditor | null;
  setEditorRef: (editor: editor.IStandaloneCodeEditor | null) => void;
}

export const useEditorRefStore = create<EditorRefState>((set) => ({
  editorRef: null,
  setEditorRef: (editor) => set({ editorRef: editor }),
}));