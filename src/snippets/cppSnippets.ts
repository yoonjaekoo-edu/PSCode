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
  {
    label: "vll",
    insertText: "vector<long long>",
    detail: "vector<long long>",
  },
  {
    label: "vpii",
    insertText: "vector<pair<int, int>>",
    detail: "vector<pair<int, int>>",
  },
  {
    label: "pq",
    insertText: "priority_queue<${1:int}> ${2:pq};",
    detail: "priority_queue (Max Heap)",
  },
  {
    label: "pqmin",
    insertText: "priority_queue<${1:int}, vector<${1:int}>, greater<${1:int}>> ${2:pq};",
    detail: "priority_queue (Min Heap)",
  },
  {
    label: "ms",
    insertText: "memset(${1:a}, ${2:0}, sizeof(${1:a}));",
    detail: "memset",
  },
  {
    label: "lower",
    insertText: "lower_bound(${1:v}.begin(), ${1:v}.end(), ${2:x}) - ${1:v}.begin()",
    detail: "lower_bound index",
  },
  {
    label: "upper",
    insertText: "upper_bound(${1:v}.begin(), ${1:v}.end(), ${2:x}) - ${1:v}.begin()",
    detail: "upper_bound index",
  },
  {
    label: "sort",
    insertText: "sort(${1:v}.begin(), ${1:v}.end());",
    detail: "sort(begin, end)",
  },
  {
    label: "unique",
    insertText: "${1:v}.erase(unique(${1:v}.begin(), ${1:v}.end()), ${1:v}.end());",
    detail: "erase unique elements",
  },
  {
    label: "gcd",
    insertText: "long long gcd(long long a, long long b) { return b ? gcd(b, a % b) : a; }",
    detail: "GCD function",
  },
  {
    label: "lcm",
    insertText: "long long lcm(long long a, long long b) { return a / gcd(a, b) * b; }",
    detail: "LCM function",
  },
  {
    label: "map",
    insertText: "map<${1:string}, ${2:int}> ${3:m};",
    detail: "map",
  },
  {
    label: "set",
    insertText: "set<${1:int}> ${2:s};",
    detail: "set",
  },
  {
    label: "unordered_map",
    insertText: "unordered_map<${1:string}, ${2:int}> ${3:m};",
    detail: "unordered_map",
  },
  {
    label: "unordered_set",
    insertText: "unordered_set<${1:int}> ${2:s};",
    detail: "unordered_set",
  },
  {
    label: "while",
    insertText: "while (${1:condition}) {\n\t$0\n}",
    detail: "while loop",
  },
  {
    label: "if",
    insertText: "if (${1:condition}) {\n\t$0\n}",
    detail: "if statement",
  },
  {
    label: "bfs",
    insertText: "queue<int> q;\nq.push(${1:start});\nvisited[${1:start}] = true;\n\nwhile (!q.empty()) {\n    int curr = q.front();\n    q.pop();\n    \n    for (int next : adj[curr]) {\n        if (!visited[next]) {\n            visited[next] = true;\n            q.push(next);\n        }\n    }\n}",
    detail: "Breadth-First Search",
  },
  {
    label: "dfs",
    insertText: "void dfs(int curr) {\n    visited[curr] = true;\n    for (int next : adj[curr]) {\n        if (!visited[next]) {\n            dfs(next);\n        }\n    }\n}",
    detail: "Depth-First Search",
  },
  {
    label: "dijkstra",
    insertText: "vector<int> dist(n + 1, 1e9);\npriority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;\n\ndist[start] = 0;\npq.push({0, start});\n\nwhile (!pq.empty()) {\n    auto [d, curr] = pq.top();\n    pq.pop();\n    \n    if (d > dist[curr]) continue;\n    \n    for (auto& edge : adj[curr]) {\n        int next = edge.first;\n        int weight = edge.second;\n        if (dist[next] > d + weight) {\n            dist[next] = d + weight;\n            pq.push({dist[next], next});\n        }\n    }\n}",
    detail: "Dijkstra Algorithm",
  },
  {
    label: "segtree",
    insertText: "struct SegTree {\n    int n;\n    vector<long long> tree;\n    SegTree(int n) : n(n), tree(4 * n) {}\n    \n    void update(int node, int start, int end, int idx, long long val) {\n        if (idx < start || idx > end) return;\n        if (start == end) {\n            tree[node] = val;\n            return;\n        }\n        int mid = (start + end) / 2;\n        update(2 * node, start, mid, idx, val);\n        update(2 * node + 1, mid + 1, end, idx, val);\n        tree[node] = tree[2 * node] + tree[2 * node + 1];\n    }\n    \n    long long query(int node, int start, int end, int l, int r) {\n        if (r < start || l > end) return 0;\n        if (l <= start && end <= r) return tree[node];\n        int mid = (start + end) / 2;\n        return query(2 * node, start, mid, l, r) + query(2 * node + 1, mid + 1, end, l, r);\n    }\n};",
    detail: "Segment Tree",
  },
  {
    label: "unionfind",
    insertText: "struct DSU {\n    vector<int> parent;\n    DSU(int n) {\n        parent.resize(n + 1);\n        for (int i = 0; i <= n; i++) parent[i] = i;\n    }\n    int find(int i) {\n        if (parent[i] == i) return i;\n        return parent[i] = find(parent[i]);\n    }\n    void unite(int i, int j) {\n        int root_i = find(i);\n        int root_j = find(j);\n        if (root_i != root_j) parent[root_i] = root_j;\n    }\n};",
    detail: "Disjoint Set Union",
  },
  {
    label: "prime",
    insertText: "vector<bool> is_prime(n + 1, true);\nis_prime[0] = is_prime[1] = false;\nfor (int i = 2; i * i <= n; i++) {\n    if (is_prime[i]) {\n        for (int j = i * i; j <= n; j += i)\n            is_prime[j] = false;\n    }\n}",
    detail: "Sieve of Eratosthenes",
  },
  {
    label: "binarysearch",
    insertText: "int low = 0, high = n - 1;\nwhile (low <= high) {\n    int mid = low + (high - low) / 2;\n    if (v[mid] == target) return mid;\n    if (v[mid] < target) low = mid + 1;\n    else high = mid - 1;\n}",
    detail: "Binary Search",
  },
  {
    label: "comb",
    insertText: "long long nCr[31][31];\nfor (int i = 0; i <= 30; i++) {\n    nCr[i][0] = 1;\n    for (int j = 1; j <= i; j++)\n        nCr[i][j] = nCr[i - 1][j - 1] + nCr[i - 1][j];\n}",
    detail: "Combination (Pascal's Triangle)",
  },
  {
    label: "modpow",
    insertText: "long long modpow(long long base, long long exp) {\n    long long res = 1;\n    base %= MOD;\n    while (exp > 0) {\n        if (exp % 2 == 1) res = (res * base) % MOD;\n        base = (base * base) % MOD;\n        exp /= 2;\n    }\n    return res;\n}",
    detail: "Modular Exponentiation",
  },
  {
    label: "coordinate_compress",
    insertText: "sort(v.begin(), v.end());\nv.erase(unique(v.begin(), v.end()), v.end());\n// find: lower_bound(v.begin(), v.end(), x) - v.begin()",
    detail: "Coordinate Compression",
  },
  {
    label: "bitmask",
    insertText: "// Check k-th bit: (mask >> k) & 1\n// Set k-th bit: mask |= (1 << k)\n// Unset k-th bit: mask &= ~(1 << k)\n// Toggle k-th bit: mask ^= (1 << k)",
    detail: "Bitmasking cheat sheet",
  },
];
