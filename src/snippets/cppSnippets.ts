export interface CppSnippet {
  label: string;
  insertText: string;
  detail: string;
}

export const CPP_SNIPPETS: CppSnippet[] = [
  {
    label: "bits",
    insertText: "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(0);\n    cin.tie(0);\n    \n    $0\n    \n    return 0;\n}",
    detail: "include bits/stdc++.h & boilerplate",
  },
  {
    label: "cinn",
    insertText: "int n;\ncin >> n;",
    detail: "input int n",
  },
  {
    label: "cinv",
    insertText: "vector<int> ${1:v}(${2:n});\nfor (int i = 0; i < ${2:n}; i++) cin >> ${1:v}[i];",
    detail: "input vector",
  },
  {
    label: "vvi",
    insertText: "vector<vector<int>> ${1:adj}(${2:n} + 1);",
    detail: "2D vector (adjacency list)",
  },
  {
    label: "ll",
    insertText: "long long",
    detail: "long long type",
  },
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
  {
    label: "pii",
    insertText: "pair<int, int>",
    detail: "pair<int, int>",
  },
  {
    label: "vi",
    insertText: "vector<int>",
    detail: "vector<int>",
  },
];
