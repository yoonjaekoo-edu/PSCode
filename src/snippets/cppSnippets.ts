export interface CppSnippet {
  label: string;
  insertText: string;
  detail: string;
}

export const CPP_SNIPPETS: CppSnippet[] = [
  {
    label: "fastio",
    insertText: "ios::sync_with_stdio(0);\ncin.tie(0);",
    detail: "Fast IO",
  },
  {
    label: "all",
    insertText: "${1:v}.begin(), ${1:v}.end()",
    detail: "begin, end",
  },
  {
    label: "rall",
    insertText: "${1:v}.rbegin(), ${1:v}.rend()",
    detail: "rbegin, rend",
  },
  {
    label: "forn",
    insertText: "for (int ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++)",
    detail: "for loop 0..n",
  },
  {
    label: "forr",
    insertText: "for (int ${1:i} = ${2:n} - 1; ${1:i} >= 0; ${1:i}--)",
    detail: "for loop n-1..0",
  },
  {
    label: "pb",
    insertText: "push_back",
    detail: "push_back",
  },
  {
    label: "eb",
    insertText: "emplace_back",
    detail: "emplace_back",
  },
];
