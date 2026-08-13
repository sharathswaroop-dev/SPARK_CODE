/**
 * Step 16: Advanced Graph Algorithms — Easy / Medium / Hard
 * Tier: Easy → 'free' | Medium → 'mid' | Hard → 'pro'
 */
export const step16Problems = [
  // ── EASY ────────────────────────────────────────────────────────────────────
  {
    slug: 'find-center-star-graph',
    title: 'Find Center of Star Graph',
    difficulty: 'Easy',
    category: 'Graph',
    tier: 'free',
    acceptanceRate: 87.2,
    description: 'Given an undirected star graph with `n` nodes where one center node is connected to every other node. Input: each line is an edge `u v`. Return the center node integer.',
    constraints: '- `3 <= n <= 10^5`',
    examples: [{ input: '1 2\n2 3\n4 2', output: '2', orderIndex: 0 }],
    testCases: [
      { input: '1 2\n2 3\n4 2', expectedOutput: '2', isHidden: false, orderIndex: 0 },
      { input: '1 2\n5 1\n1 3\n1 4', expectedOutput: '1', isHidden: false, orderIndex: 1 },
    ],
    starterCode: {
      python: `import sys\nlines = sys.stdin.read().strip().split('\\n')\ne1 = list(map(int, lines[0].split()))\ne2 = list(map(int, lines[1].split()))\nif e1[0] in e2: print(e1[0])\nelse: print(e1[1])\n`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst e1 = lines[0].split(' ').map(Number);\nconst e2 = lines[1].split(' ').map(Number);\nconsole.log(e2.includes(e1[0]) ? e1[0] : e1[1]);\n`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int u1 = sc.nextInt(), v1 = sc.nextInt();\n        int u2 = sc.nextInt(), v2 = sc.nextInt();\n        if (u1 == u2 || u1 == v2) System.out.println(u1);\n        else System.out.println(v1);\n    }\n}\n`,
    },
  },

  // ── MEDIUM ────────────────────────────────────────────────────────────────────
  {
    slug: 'topological-sort-kahn',
    title: 'Topological Sort (Kahn\'s Algorithm)',
    difficulty: 'Medium',
    category: 'Graph',
    tier: 'mid',
    acceptanceRate: 71.4,
    description: 'Given a Directed Acyclic Graph (DAG) with `V` vertices numbered `0` to `V-1`, return a topological ordering of vertices space-separated. Line 1: `V E`, next E lines: directed edges `u v`.',
    constraints: '- `1 <= V, E <= 10^4`',
    examples: [{ input: '4 3\n0 1\n0 2\n1 3', output: '0 1 2 3', orderIndex: 0 }],
    testCases: [
      { input: '4 3\n0 1\n0 2\n1 3', expectedOutput: '0 1 2 3', isHidden: false, orderIndex: 0 },
    ],
    starterCode: {
      python: `import sys\nfrom collections import deque\nlines = sys.stdin.read().strip().split('\\n')\nV, E = map(int, lines[0].split())\nindegree = [0] * V\nadj = [[] for _ in range(V)]\nfor i in range(1, E + 1):\n    if not lines[i].strip(): continue\n    u, v = map(int, lines[i].split())\n    adj[u].append(v); indegree[v] += 1\nq = deque([i for i in range(V) if indegree[i] == 0])\nres = []\nwhile q:\n    curr = q.popleft(); res.append(curr)\n    for nxt in adj[curr]:\n        indegree[nxt] -= 1\n        if indegree[nxt] == 0: q.append(nxt)\nprint(*res)\n`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst [V, E] = lines[0].split(' ').map(Number);\nconst indegree = new Array(V).fill(0);\nconst adj = Array.from({length: V}, () => []);\nfor(let i=1; i<=E; i++) {\n  if(!lines[i].strip) continue;\n  const [u, v] = lines[i].split(' ').map(Number);\n  adj[u].push(v); indegree[v]++;\n}\nconst q = [];\nfor(let i=0; i<V; i++) if(indegree[i]===0) q.push(i);\nconst res = [];\nwhile(q.length) {\n  const curr = q.shift(); res.push(curr);\n  adj[curr].forEach(nxt => {\n    indegree[nxt]--;\n    if(indegree[nxt] === 0) q.push(nxt);\n  });\n}\nconsole.log(res.join(' '));\n`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int V = sc.nextInt(), E = sc.nextInt();\n        int[] indegree = new int[V];\n        List<List<Integer>> adj = new ArrayList<>();\n        for(int i=0; i<V; i++) adj.add(new ArrayList<>());\n        for(int i=0; i<E; i++) {\n            int u = sc.nextInt(), v = sc.nextInt();\n            adj.get(u).add(v); indegree[v]++;\n        }\n        Queue<Integer> q = new LinkedList<>();\n        for(int i=0; i<V; i++) if(indegree[i] == 0) q.add(i);\n        List<Integer> res = new ArrayList<>();\n        while(!q.isEmpty()) {\n            int curr = q.poll(); res.add(curr);\n            for(int nxt : adj.get(curr)) {\n                indegree[nxt]--; if(indegree[nxt] == 0) q.add(nxt);\n            }\n        }\n        StringBuilder sb = new StringBuilder();\n        for(int i=0; i<res.size(); i++) sb.append(res.get(i)).append(i<res.size()-1?" ":"");\n        System.out.println(sb);\n    }\n}\n`,
    },
  },

  // ── HARD ─────────────────────────────────────────────────────────────────────
  {
    slug: 'network-delay-time-dijkstra',
    title: 'Network Delay Time (Shortest Path)',
    difficulty: 'Hard',
    category: 'Graph',
    tier: 'pro',
    acceptanceRate: 53.6,
    description: 'You are given a network of `n` nodes labeled `1` to `n`. You are also given `times`, a list of travel times as directed edges `u v w`. We send a signal from a given node `k`. Return the minimum time it takes for all `n` nodes to receive the signal. Return -1 if impossible. Line 1: `n k E`, next E lines: `u v w`.',
    constraints: '- `1 <= k <= n <= 100`\n- `1 <= E <= 6000`',
    examples: [{ input: '4 2 3\n2 1 1\n2 3 1\n3 4 1', output: '2', orderIndex: 0 }],
    testCases: [
      { input: '4 2 3\n2 1 1\n2 3 1\n3 4 1', expectedOutput: '2', isHidden: false, orderIndex: 0 },
      { input: '2 1 1\n1 2 1', expectedOutput: '1', isHidden: false, orderIndex: 1 },
      { input: '2 2 1\n1 2 1', expectedOutput: '-1', isHidden: true, orderIndex: 2 },
    ],
    starterCode: {
      python: `import sys, heapq\nlines = sys.stdin.read().strip().split('\\n')\nn, k, E = map(int, lines[0].split())\nadj = [[] for _ in range(n + 1)]\nfor i in range(1, E + 1):\n    if not lines[i].strip(): continue\n    u, v, w = map(int, lines[i].split())\n    adj[u].append((v, w))\npq = [(0, k)]\ndist = {}\nwhile pq:\n    d, u = heapq.heappop(pq)\n    if u in dist: continue\n    dist[u] = d\n    for v, w in adj[u]:\n        if v not in dist:\n            heapq.heappush(pq, (d + w, v))\nprint(max(dist.values()) if len(dist) == n else -1)\n`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst [n, k, E] = lines[0].split(' ').map(Number);\nconst adj = Array.from({length: n + 1}, () => []);\nfor(let i=1; i<=E; i++) {\n  if(!lines[i].trim()) continue;\n  const [u, v, w] = lines[i].split(' ').map(Number);\n  adj[u].push([v, w]);\n}\nconst dist = new Array(n + 1).fill(Infinity);\ndist[k] = 0;\nconst pq = [[0, k]];\nwhile(pq.length) {\n  pq.sort((a,b) => a[0] - b[0]);\n  const [d, u] = pq.shift();\n  if (d > dist[u]) continue;\n  for(const [v, w] of adj[u]) {\n    if (dist[u] + w < dist[v]) {\n      dist[v] = dist[u] + w;\n      pq.push([dist[v], v]);\n    }\n  }\n}\nconst maxD = Math.max(...dist.slice(1));\nconsole.log(maxD === Infinity ? -1 : maxD);\n`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt(), k = sc.nextInt(), E = sc.nextInt();\n        List<List<int[]>> adj = new ArrayList<>();\n        for(int i=0; i<=n; i++) adj.add(new ArrayList<>());\n        for(int i=0; i<E; i++) {\n            int u = sc.nextInt(), v = sc.nextInt(), w = sc.nextInt();\n            adj.get(u).add(new int[]{v, w});\n        }\n        int[] dist = new int[n+1]; Arrays.fill(dist, Integer.MAX_VALUE); dist[k] = 0;\n        PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(a -> a[0]));\n        pq.add(new int[]{0, k});\n        while(!pq.isEmpty()) {\n            int[] curr = pq.poll(); int d = curr[0], u = curr[1];\n            if (d > dist[u]) continue;\n            for(int[] edge : adj.get(u)) {\n                int v = edge[0], w = edge[1];\n                if (dist[u] + w < dist[v]) {\n                    dist[v] = dist[u] + w;\n                    pq.add(new int[]{dist[v], v});\n                }\n            }\n        }\n        int maxD = 0;\n        for(int i=1; i<=n; i++) {\n            if (dist[i] == Integer.MAX_VALUE) { System.out.println(-1); return; }\n            maxD = Math.max(maxD, dist[i]);\n        }\n        System.out.println(maxD);\n    }\n}\n`,
    },
  },
];
