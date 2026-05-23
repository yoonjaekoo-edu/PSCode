/**
 * C++ Code Formatter for Monaco Editor
 */

const TEMPLATE_CONTAINERS = new Set([
  "vector", "map", "set", "unordered_map", "unordered_set", "queue", "stack", "priority_queue", "pair",
  "greater", "less", "list", "array", "deque", "multiset", "multimap", "tuple"
]);

const TYPES = new Set([
  "int", "double", "float", "char", "bool", "void", "string", "long", "short", "signed", "unsigned", "auto", "size_t"
]);

// Binary/assignment operators that ALWAYS need spaces
const SPATIAL_OPERATORS = new Set([
  "=", "+=", "-=", "*=", "/=", "%=", "&=", "^=", "|=", "<<=", ">>=",
  "==", "!=", "<=", ">=", "&&", "||", "<<", ">>", "?", ":"
]);

export function formatCppCode(code: string): string {
  const lines = code.split("\n");
  let inMultiLineComment = false;

  const formattedLines = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed) return line;

    // Preserve preprocessor directives
    if (trimmed.startsWith("#")) {
      return line;
    }

    // Preserve single line comments
    if (trimmed.startsWith("//")) {
      return line;
    }

    // Handle multiline comment block states
    if (inMultiLineComment) {
      if (trimmed.includes("*/")) {
        inMultiLineComment = false;
      }
      return line;
    }
    if (trimmed.startsWith("/*")) {
      if (!trimmed.includes("*/")) {
        inMultiLineComment = true;
      }
      return line;
    }

    // Preserve indentation
    const indentMatch = line.match(/^\s*/);
    const indent = indentMatch ? indentMatch[0] : "";

    // Tokenize the line
    const tokenRegex = /\/\/.*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b\d+(?:\.\d+)?\b|[a-zA-Z_][a-zA-Z0-9_]*|\+\+|--|<<=|>>=|==|!=|<=|>=|\+=|-=|\*=|\/=|%=|&=|\^=|\|=|&&|\|\||<<|>>|->|::|[=+\-*\/%<>&|^!~?:,;\(\)\[\]\{\}]/g;

    const tokens: string[] = trimmed.match(tokenRegex) || [];
    if (tokens.length === 0) return line;

    const formattedTokens: string[] = [];

    for (let i = 0; i < tokens.length; i++) {
      const curr = tokens[i];
      const prev = i > 0 ? tokens[i - 1] : null;
      const next = i < tokens.length - 1 ? tokens[i + 1] : null;

      if (curr.trim() === "" && curr !== " ") continue;

      if (formattedTokens.length === 0) {
        formattedTokens.push(curr);
        continue;
      }

      let spaceBefore = false;

      // 1. Punctuation spacing (comma, semicolon)
      if (curr === ";" || curr === ",") {
        spaceBefore = false;
      } else if (prev === "," || prev === ";") {
        spaceBefore = true;
      }
      // 2. Space around spatial operators
      else if (SPATIAL_OPERATORS.has(curr) || (prev && SPATIAL_OPERATORS.has(prev))) {
        spaceBefore = true;
      }
      // 3. Arithmetic operators (+, -, *, /, %)
      else if (curr === "+" || curr === "-") {
        const isUnary = !prev || 
          prev === "=" || prev === "(" || prev === "[" || prev === "," || prev === ";" || 
          prev === "?" || prev === ":" || prev === "&&" || prev === "||" || 
          prev === "+" || prev === "-" || prev === "*" || prev === "/" || prev === "%" || 
          SPATIAL_OPERATORS.has(prev);

        if (isUnary) {
          spaceBefore = (prev !== null && !isOperator(prev));
        } else {
          spaceBefore = true;
        }
      } else if (prev === "+" || prev === "-") {
        const isLastUnary = i > 1 ? (
          (() => {
            const pprev = tokens[i - 2];
            return !pprev || 
              pprev === "=" || pprev === "(" || pprev === "[" || pprev === "," || pprev === ";" || 
              pprev === "?" || pprev === ":" || pprev === "&&" || pprev === "||" || 
              pprev === "+" || pprev === "-" || pprev === "*" || pprev === "/" || pprev === "%" || 
              SPATIAL_OPERATORS.has(pprev);
          })()
        ) : true;

        if (isLastUnary) {
          spaceBefore = false;
        } else {
          spaceBefore = true;
        }
      }
      // 4. Pointer and reference spacing (*, &)
      else if (curr === "*" || curr === "&") {
        const isPrevType = prev && (TYPES.has(prev) || prev.endsWith(">") || prev === "auto");
        if (isPrevType) {
          spaceBefore = false;
        } else {
          const isUnaryPtr = !prev || isOperator(prev);
          if (isUnaryPtr) {
            spaceBefore = (prev !== null && prev !== "(" && prev !== "[");
          } else {
            spaceBefore = true;
          }
        }
      } else if (prev === "*" || prev === "&") {
        const pprev = i > 1 ? tokens[i - 2] : null;
        const isPtrDecl = pprev && (TYPES.has(pprev) || pprev.endsWith(">") || pprev === "auto");
        const isUnaryPtr = !pprev || isOperator(pprev);

        if (isPtrDecl) {
          spaceBefore = true;
        } else if (isUnaryPtr) {
          spaceBefore = false;
        } else {
          spaceBefore = true;
        }
      }
      // 5. Template brackets < and >
      else if (curr === "<" || curr === ">") {
        const isTemplateOpen = curr === "<" && prev && TEMPLATE_CONTAINERS.has(prev);
        const isTemplateClose = curr === ">" && (next === ";" || next === "*" || next === "&" || (next && /^[a-zA-Z_]/.test(next)));

        if (isTemplateOpen || isTemplateClose) {
          spaceBefore = false;
        } else {
          spaceBefore = true;
        }
      } else if (prev === "<" || prev === ">") {
        const pprev = i > 1 ? tokens[i - 2] : null;
        const isLastTemplateOpen = prev === "<" && pprev && TEMPLATE_CONTAINERS.has(pprev);
        
        if (isLastTemplateOpen) {
          spaceBefore = false;
        } else {
          spaceBefore = true;
        }
      }
      // 6. Keywords spacing before parenthesis
      else if (curr === "(") {
        if (prev === "if" || prev === "for" || prev === "while" || prev === "switch") {
          spaceBefore = true;
        } else {
          spaceBefore = false;
        }
      } else if (curr === "{") {
        spaceBefore = true;
      }
      // 7. Standard identifiers spacing
      else {
        const isWordOrNum = (str: string) => /^[a-zA-Z0-9_]+$/.test(str) || str.startsWith('"') || str.startsWith("'");
        if (isWordOrNum(curr) && prev && isWordOrNum(prev)) {
          spaceBefore = true;
        }
      }

      formattedTokens.push(spaceBefore ? " " + curr : curr);
    }

    return indent + formattedTokens.join("");
  });

  return formattedLines.join("\n");
}

function isOperator(tok: string): boolean {
  return /^[=+\-*\/%<>&|^!~?:,;\(\)\[\]\{\}]+$/.test(tok) || SPATIAL_OPERATORS.has(tok);
}

import type { Monaco } from "@monaco-editor/react";
import type * as monacoEditor from "monaco-editor";

export function registerFormatter(monaco: Monaco): () => void {
  const provider = monaco.languages.registerDocumentFormattingEditProvider("cpp", {
    provideDocumentFormattingEdits(
      model: monacoEditor.editor.ITextModel,
      _options: monacoEditor.languages.FormattingOptions,
      _token: monacoEditor.CancellationToken
    ): monacoEditor.languages.ProviderResult<monacoEditor.languages.TextEdit[]> {
      const text = model.getValue();
      const formatted = formatCppCode(text);
      return [
        {
          range: model.getFullModelRange(),
          text: formatted,
        },
      ];
    },
  });

  return () => provider.dispose();
}

