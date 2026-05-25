import { useMemo, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useMarkdownStore } from "./markdownStore";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function parseInline(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code class='md-inline-code'>$1</code>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="md-link">$1</a>')
    .replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" class="md-image">');
}

function renderMarkdown(md: string): string {
  const lines = md.split("\n");
  const parts: string[] = [];
  let inCode = false;
  let codeBuf: string[] = [];
  let codeLang = "";
  let inList: "ul" | "ol" | null = null;

  const closeList = () => {
    if (inList === "ul") { parts.push("</ul>"); inList = null; }
    else if (inList === "ol") { parts.push("</ol>"); inList = null; }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("```")) {
      if (inCode) {
        const lang = codeLang ? ` class="language-${escapeHtml(codeLang)}"` : "";
        const code = escapeHtml(codeBuf.join("\n"));
        parts.push(`<pre><code${lang}>${code}</code></pre>`);
        codeBuf = [];
        codeLang = "";
        inCode = false;
      } else {
        closeList();
        inCode = true;
        codeLang = line.slice(3).trim();
      }
      continue;
    }

    if (inCode) {
      codeBuf.push(line);
      continue;
    }

    const trimmed = line.trim();

    if (trimmed === "") {
      closeList();
      continue;
    }

    closeList();

    if (trimmed.startsWith("### ")) {
      parts.push(`<h3 class="md-h3">${parseInline(trimmed.slice(4))}</h3>`);
      continue;
    }
    if (trimmed.startsWith("## ")) {
      parts.push(`<h2 class="md-h2">${parseInline(trimmed.slice(3))}</h2>`);
      continue;
    }
    if (trimmed.startsWith("# ")) {
      parts.push(`<h1 class="md-h1">${parseInline(trimmed.slice(2))}</h1>`);
      continue;
    }

    if (/^-{3,}$/.test(trimmed)) {
      parts.push(`<hr class="md-hr">`);
      continue;
    }

    if (trimmed.startsWith("> ")) {
      parts.push(`<blockquote class="md-blockquote">${parseInline(trimmed.slice(2))}</blockquote>`);
      continue;
    }

    if (/^[-*+]\s/.test(trimmed)) {
      closeList();
      parts.push(`<ul class="md-ul">`);
      inList = "ul";
      parts.push(`<li class="md-li">${parseInline(trimmed.replace(/^[-*+]\s/, ""))}</li>`);
      while (i + 1 < lines.length && /^[-*+]\s/.test(lines[i + 1].trim())) {
        i++;
        parts.push(`<li class="md-li">${parseInline(lines[i].trim().replace(/^[-*+]\s/, ""))}</li>`);
      }
      parts.push(`</ul>`);
      inList = null;
      continue;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      closeList();
      parts.push(`<ol class="md-ol">`);
      inList = "ol";
      parts.push(`<li class="md-li">${parseInline(trimmed.replace(/^\d+\.\s/, ""))}</li>`);
      while (i + 1 < lines.length && /^\d+\.\s/.test(lines[i + 1].trim())) {
        i++;
        parts.push(`<li class="md-li">${parseInline(lines[i].trim().replace(/^\d+\.\s/, ""))}</li>`);
      }
      parts.push(`</ol>`);
      inList = null;
      continue;
    }

    parts.push(`<p class="md-p">${parseInline(trimmed)}</p>`);
  }

  if (inCode) {
    const code = escapeHtml(codeBuf.join("\n"));
    parts.push(`<pre><code>${code}</code></pre>`);
  }

  closeList();

  return parts.join("\n");
}

export function MarkdownViewer() {
  const { t } = useTranslation();
  const filePath = useMarkdownStore((s) => s.filePath);
  const content = useMarkdownStore((s) => s.content);
  const scrollRef = useRef<HTMLDivElement>(null);

  const html = useMemo(() => renderMarkdown(content), [content]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [filePath]);

  if (!filePath) {
    return (
      <div className="flex flex-1 items-center justify-center text-[var(--text-muted)] select-none text-sm">
        {t("editor.placeholder")}
      </div>
    );
  }

  const fileName = filePath.split(/[/\\]/).pop() ?? "";

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)]">
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[var(--border)] bg-[var(--bg-secondary)] shrink-0">
        <MdIcon className="w-4 h-4 text-orange-400 shrink-0" />
        <span className="text-xs text-[var(--text-secondary)] truncate">{fileName}</span>
      </div>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 py-4"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

function MdIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.56 18H3.44C2.65 18 2 17.37 2 16.59V7.41C2 6.63 2.65 6 3.44 6h17.12c.79 0 1.44.63 1.44 1.41v9.18c0 .78-.65 1.41-1.44 1.41zM6.81 15.19v-3.66l1.92 2.35 1.92-2.35v3.66h1.93V8.81h-1.93l-1.92 2.35-1.92-2.35H4.88v6.38h1.93zm9.62-1.36l-2.81-3.63h1.74V8.81h1.93v1.39h1.74l-2.81 3.63v1.36h1.93v-1.36z" />
    </svg>
  );
}
