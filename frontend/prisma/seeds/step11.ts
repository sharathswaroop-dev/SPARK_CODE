/**
 * Step 11: Graph Algorithms — Easy / Medium / Hard
 * Tier: Easy → 'free' | Medium → 'mid' | Hard → 'pro'
 */
export const step11Problems = [
  // ── EASY ────────────────────────────────────────────────────────────────────
  {
    slug: 'bfs-traversal-graph',
    title: 'Breadth First Search (BFS) of Graph',
    difficulty: 'Easy',
    category: 'Graph',
    tier: 'free',
    acceptanceRate: 83.7,
    description: 'Given an adjacency list for an undirected graph with `V` vertices numbered `0` to `V-1`, return BFS traversal starting from vertex 0. Input: Line 1 has V and E. Next E lines are edges `u v`.',
    constraints: '- `1 <= V, E <= 10^4`',
    examples: [{ input: '5 4\n0 1\n0 2\n0 3\n2 4', output: '0 1 2 3 4', orderIndex: 0 }],
    testCases: [
      { input: '5 4\n0 1\n0 2\n0 3\n2 4', expectedOutput: '0 1 2 3 4', isHidden: false, orderIndex: 0 },
      { input: '3 2\n0 1\n1 2', expectedOutput: '0 1 2', isHidden: false, orderIndex: 1 },
    ],
    starterCode: {
      python: `import sys\nfrom collections import deque, defaultdict\nlines = sys.stdin.read().split('\\n')\nV, E = map(int, lines[0].split())\nadj = defaultdict(list)\nfor i in range(1, E + 1):\n    if not lines[i].strip(): continue\n    u, v = map(int, lines[i].split())\n    adj[u].append(v); adj[v].append(u)\nq = deque([0]); visited = {0}; res = []\nwhile q:\n    node = q.popleft(); res.append(node)\n    for neighbor in sorted(adj[node]):\n        if neighbor not in visited:\n            visited.add(neighbor); q.append(neighbor)\nprint(*res)\n`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').split('\\n');\nconst [V, E] = lines[0].split(' ').map(Number);\nconst adj = Array.from({length: V}, () => []);\nfor(let i=1; i<=E; i++) {\n  if(!lines[i].trim()) continue;\n  const [u,v] = lines[i].split(' ').map(Number);\n  adj[u].push(v); adj[v].push(u);\n}\nconst visited = new Set([0]), q = [0], res = [];\nwhile(q.length) {\n  const curr = q.shift(); res.push(curr);\n  adj[curr].sort((a,b)=>a-b).forEach(n => {\n    if(!visited.has(n)) { visited.add(n); q.push(n); }\n  });\n}\nconsole.log(res.join(' '));\n`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int V = sc.nextInt(), E = sc.nextInt();\n        List<List<Integer>> adj = new ArrayList<>();\n        for(int i=0; i<V; i++) adj.add(new ArrayList<>());\n        for(int i=0; i<E; i++) {\n            int u = sc.nextInt(), v = sc.nextInt();\n            adj.get(u).add(v); adj.get(v).add(u);\n        }\n        boolean[] vis = new boolean[V]; vis[0] = true;\n        Queue<Integer> q = new LinkedList<>(); q.add(0);\n        List<Integer> res = new ArrayList<>();\n        while(!q.isEmpty()) {\n            int curr = q.poll(); res.add(curr);\n            Collections.sort(adj.get(curr));\n            for(int n : adj.get(curr)) if(!vis[n]) { vis[n] = true; q.add(n); }\n        }\n        StringBuilder sb = new StringBuilder();\n        for(int i=0; i<res.size(); i++) sb.append(res.get(i)).append(i<res.size()-1?" ":"");\n        System.out.println(sb);\n    }\n}\n`,
    },
  },

  // ── MEDIUM ────────────────────────────────────────────────────────────────────
  {
    slug: 'course-schedule-cycle',
    title: 'Course Schedule (Cycle Detection)',
    difficulty: 'Medium',
    category: 'Graph',
    tier: 'mid',
    acceptanceRate: 67.5,
    description: 'There are `numCourses` courses numbered `0` to `numCourses-1`. You are given prerequisite pairs `[a, b]` meaning you must take `b` before `a`. Return `true` if you can finish all courses, else `false`. Line 1: `numCourses` and `E`. Next E lines: `a b`.',
    constraints: '- `1 <= numCourses <= 2000`\n- `0 <= E <= 5000`',
    examples: [{ input: '2 1\n1 0', output: 'true', orderIndex: 0 }],
    testCases: [
      { input: '2 1\n1 0', expectedOutput: 'true', isHidden: false, orderIndex: 0 },
      { input: '2 2\n1 0\n0 1', expectedOutput: 'false', isHidden: false, orderIndex: 1 },
    ],
    starterCode: {
      python: `import sys\nlines = sys.stdin.read().split('\\n')\nnumCourses, E = map(int, lines[0].split())\nadj = [[] for _ in range(numCourses)]\nfor i in range(1, E+1):\n    if not lines[i].strip(): continue\n    a, b = map(int, lines[i].split())\n    adj[b].append(a)\nvis = [0] * numCourses\ndef dfs(u):\n    if vis[u] == 1: return False\n    if vis[u] == 2: return True\n    vis[u] = 1\n    for v in adj[u]:\n        if not dfs(v): return False\n    vis[u] = 2; return True\nprint(str(all(dfs(i) for i in range(numCourses) if vis[i] == 0)).lower())\n`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').split('\\n');\nconst [numCourses, E] = lines[0].split(' ').map(Number);\nconst adj = Array.from({length: numCourses}, () => []);\nfor(let i=1; i<=E; i++) {\n  if(!lines[i].trim()) continue;\n  const [a,b] = lines[i].split(' ').map(Number);\n  adj[b].push(a);\n}\nconst vis = new Array(numCourses).fill(0);\nfunction dfs(u) {\n  if(vis[u] === 1) return false;\n  if(vis[u] === 2) return true;\n  vis[u] = 1;\n  for(const v of adj[u]) if(!dfs(v)) return false;\n  vis[u] = 2; return true;\n}\nlet ok = true;\nfor(let i=0; i<numCourses; i++) if(!vis[i] && !dfs(i)) { ok = false; break; }\nconsole.log(ok);\n`,
      java: `import java.util.*;\npublic class Main {\n    static List<List<Integer>> adj = new ArrayList<>(); static int[] vis;\n    static boolean dfs(int u) {\n        if(vis[u] == 1) return false;\n        if(vis[u] == 2) return true;\n        vis[u] = 1;\n        for(int v : adj.get(u)) if(!dfs(v)) return false;\n        vis[u] = 2; return true;\n    }\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt(), e = sc.nextInt();\n        for(int i=0; i<n; i++) adj.add(new ArrayList<>());\n        for(int i=0; i<e; i++) {\n            int a = sc.nextInt(), b = sc.nextInt();\n            adj.get(b).add(a);\n        }\n        vis = new int[n]; boolean ok = true;\n        for(int i=0; i<n; i++) if(vis[i] == 0 && !dfs(i)) { ok = false; break; }\n        System.out.println(ok);\n    }\n}\n`,
    },
  },

  // ── HARD ─────────────────────────────────────────────────────────────────────
  {
    slug: 'word-ladder-shortest',
    title: 'Word Ladder Shortest Transformation',
    difficulty: 'Hard',
    category: 'Graph',
    tier: 'pro',
    acceptanceRate: 48.9,
    description: 'Given `beginWord`, `endWord`, and a dictionary `wordList`, return the number of words in the shortest transformation sequence from `beginWord` to `endWord`, where each step changes exactly 1 letter. Line 1: `beginWord`, Line 2: `endWord`, Line 3: space-separated `wordList`.',
    constraints: '- `1 <= wordList.length <= 5000`',
    examples: [{ input: 'hit\ncog\nhot dot dog lot log cog', output: '5', explanation: 'hit -> hot -> dot -> dog -> cog', orderIndex: 0 }],
    testCases: [
      { input: 'hit\ncog\nhot dot dog lot log cog', expectedOutput: '5', isHidden: false, orderIndex: 0 },
      { input: 'hit\ncog\nhot dot dog lot log', expectedOutput: '0', isHidden: false, orderIndex: 1 },
    ],
    starterCode: {
      python: `import sys\nfrom collections import deque\nlines = sys.stdin.read().split('\\n')\nbegin, end = lines[0].strip(), lines[1].strip()\nwords = set(lines[2].split())\nif end not in words: print(0); exit()\nq = deque([(begin, 1)])\nvisited = {begin}\nwhile q:\n    w, d = q.popleft()\n    if w == end: print(d); exit()\n    for i in range(len(w)):\n        for c in 'abcdefghijklmnopqrstuvwxyz':\n            nw = w[:i] + c + w[i+1:]\n            if nw in words and nw not in visited:\n                visited.add(nw); q.append((nw, d+1))\nprint(0)\n`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').split('\\n');\nconst begin = lines[0].trim(), end = lines[1].trim();\nconst words = new Set(lines[2].split(' '));\nif (!words.has(end)) { console.log(0); process.exit(); }\nconst q = [[begin, 1]], vis = new Set([begin]);\nwhile(q.length) {\n  const [w, d] = q.shift();\n  if (w === end) { console.log(d); process.exit(); }\n  for(let i=0; i<w.length; i++) {\n    for(let c=97; c<=122; c++) {\n      const nw = w.slice(0,i) + String.fromCharCode(c) + w.slice(i+1);\n      if (words.has(nw) && !vis.has(nw)) { vis.add(nw); q.push([nw, d+1]); }\n    }\n  }\n}\nconsole.log(0);\n`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String begin = sc.next(), end = sc.next();\n        sc.nextLine();\n        Set<String> words = new HashSet<>(Arrays.asList(sc.nextLine().split(" ")));\n        if (!words.contains(end)) { System.out.println(0); return; }\n        Queue<Object[]> q = new LinkedList<>(); q.add(new Object[]{begin, 1});\n        Set<String> vis = new HashSet<>(); vis.add(begin);\n        while(!q.isEmpty()) {\n            Object[] curr = q.poll(); String w = (String)curr[0]; int d = (Integer)curr[1];\n            if (w.equals(end)) { System.out.println(d); return; }\n            char[] chs = w.toCharArray();\n            for(int i=0; i<chs.length; i++) {\n                char orig = chs[i];\n                for(char c='a'; c<='z'; c++) {\n                    chs[i] = c; String nw = new String(chs);\n                    if (words.contains(nw) && !vis.contains(nw)) { vis.add(nw); q.add(new Object[]{nw, d+1}); }\n                }\n                chs[i] = orig;\n            }\n        }\n        System.out.println(0);\n    }\n}\n`,
    },
  },
];
