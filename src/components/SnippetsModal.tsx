import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useUiStore } from "@/ui/stores/uiStore";
import { CPP_SNIPPETS, type CppSnippet } from "@/snippets/cppSnippets";
import { useEditorRefStore } from "@/editor/editorRefStore";

export function SnippetsModal() {
  useTranslation();
  const open = useUiStore((s) => s.snippetsOpen);
  const setOpen = useUiStore((s) => s.setSnippetsOpen);
  
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<CppSnippet>(CPP_SNIPPETS[0]);
  const [copied, setCopied] = useState(false);

  // Reset states when modal is opened/closed
  useEffect(() => {
    if (open) {
      setSearch("");
      setSelected(CPP_SNIPPETS[0]);
      setCopied(false);
    }
  }, [open]);

  if (!open) return null;

  const filtered = CPP_SNIPPETS.filter(
    (s) =>
      s.label.toLowerCase().includes(search.toLowerCase()) ||
      s.detail.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  const handleInsert = (snippet: CppSnippet) => {
    const editor = useEditorRefStore.getState().editorRef;
    if (!editor) {
      alert("스니펫을 삽입할 활성화된 에디터가 없습니다. C++ 파일을 먼저 열어 주세요.");
      return;
    }

    try {
      editor.focus();
      // Use Monaco's official snippet controller for interactive Tab-stops
      const contrib = editor.getContribution("snippetController2") as any;
      if (contrib && contrib.insert) {
        contrib.insert(snippet.insertText, 0, 0, false, false);
      } else {
        // Fallback: strip placeholders and insert plain text
        const cleanText = snippet.insertText
          .replace(/\$\{\d+:([^}]+)\}/g, "$1")
          .replace(/\$\d+/g, "");
        const selection = editor.getSelection();
        if (selection) {
          editor.executeEdits("snippets", [
            {
              range: selection,
              text: cleanText,
              forceMoveMarkers: true,
            },
          ]);
        }
      }
      setOpen(false); // Close modal on successful insertion
    } catch (err) {
      console.error("Insertion failed:", err);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-4xl h-[520px] bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-2xl flex flex-col overflow-hidden text-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-[var(--accent)]"
            >
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
              <line x1="4" y1="22" x2="4" y2="15"></line>
            </svg>
            <h2 className="text-base font-bold text-white">C++ STL 스니펫 라이브러리</h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-[var(--text-secondary)] hover:text-white transition-colors cursor-pointer text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 flex min-h-0">
          {/* Left Panel: List & Search */}
          <div className="w-[320px] border-r border-[var(--border)] flex flex-col bg-[var(--bg-tertiary)] min-h-0">
            {/* Search Box */}
            <div className="p-3 border-b border-[var(--border)]">
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="스니펫 검색 (예: vector, sort)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="absolute left-2.5 w-3.5 h-3.5 text-[var(--text-muted)]"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
              {filtered.length === 0 ? (
                <div className="px-3 py-4 text-xs text-[var(--text-muted)] italic text-center">
                  검색 결과가 없습니다.
                </div>
              ) : (
                filtered.map((snippet) => (
                  <button
                    key={snippet.label}
                    type="button"
                    onClick={() => {
                      setSelected(snippet);
                      setCopied(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded text-xs transition-colors flex flex-col gap-0.5 cursor-pointer ${
                      selected.label === snippet.label
                        ? "bg-[var(--bg-active)] text-white"
                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <span className="font-mono font-bold text-sm tracking-wide">
                      {snippet.label}
                    </span>
                    <span
                      className={`text-[10px] truncate ${
                        selected.label === snippet.label
                          ? "text-blue-100"
                          : "text-[var(--text-muted)]"
                      }`}
                    >
                      {snippet.detail}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right Panel: Preview & Insert */}
          <div className="flex-1 flex flex-col bg-[var(--bg-primary)] p-5 min-h-0 justify-between">
            <div className="flex flex-col flex-1 min-h-0">
              {/* Header Info */}
              <div className="mb-4 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg font-bold text-white bg-[var(--bg-active)] px-2 py-0.5 rounded shadow">
                    {selected.label}
                  </span>
                  <span className="text-xs text-[var(--text-secondary)]">
                    C++ STL Snippet
                  </span>
                </div>
                <p className="mt-2 text-xs text-[var(--text-primary)] bg-[var(--bg-secondary)] px-3 py-2 rounded border border-[var(--border)]">
                  {selected.detail}
                </p>
              </div>

              {/* Code Editor Preview */}
              <div className="flex-1 min-h-0 relative border border-[var(--border)] rounded-lg overflow-hidden bg-[#1e1e1e] shadow-inner">
                <pre className="w-full h-full p-4 overflow-auto font-mono text-xs text-blue-300 leading-relaxed select-text selection:bg-[var(--bg-active)]">
                  <code>{selected.insertText}</code>
                </pre>
                
                {/* Floating indicator */}
                <span className="absolute top-2.5 right-3 text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                  PREVIEW
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--border)] shrink-0">
              <div className="text-[11px] text-[var(--text-muted)] italic max-w-[280px]">
                Tip: 에디터에서 단어 입력 후 <kbd className="bg-[var(--bg-tertiary)] px-1 py-0.5 rounded border border-[var(--border)] not-italic font-bold">Tab</kbd> 키를 눌러 스니펫을 바로 호출할 수도 있습니다.
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void handleCopy(selected.insertText)}
                  className={`px-4 py-2 rounded text-xs transition-all font-semibold flex items-center gap-1.5 cursor-pointer border ${
                    copied
                      ? "bg-[var(--success)]/20 border-[var(--success)] text-[var(--success)]"
                      : "bg-[var(--bg-secondary)] border-[var(--border)] hover:bg-[var(--bg-hover)] text-white"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-3.5 h-3.5"
                  >
                    {copied ? (
                      <path d="M20 6L9 17l-5-5"></path>
                    ) : (
                      <>
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </>
                    )}
                  </svg>
                  <span>{copied ? "복사 완료!" : "코드 복사"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleInsert(selected)}
                  className="px-5 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded text-xs transition-all font-bold flex items-center gap-1.5 cursor-pointer shadow hover:shadow-lg"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="w-3.5 h-3.5"
                  >
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  <span>에디터에 삽입</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
