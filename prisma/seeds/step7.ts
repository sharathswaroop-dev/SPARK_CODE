/**
 * Step 7: Recursion & Backtracking — Easy / Medium / Hard
 * Tier: Easy → 'free' | Medium → 'mid' | Hard → 'pro'
 */
export const step7Problems = [
  // ── EASY ────────────────────────────────────────────────────────────────────
  {
    slug: 'pow-x-n',
    title: 'Pow(x, n) - Power Function',
    difficulty: 'Easy',
    category: 'Recursion',
    tier: 'free',
    acceptanceRate: 78.9,
    description: 'Calculate `x` raised to the power `n` (`x^n`). Input: `x` on line 1, `n` on line 2. Output result rounded to 4 decimal places.',
    constraints: '- `-100.0 < x < 100.0`\n- `-2^31 <= n <= 2^31 - 1`',
    examples: [{ input: '2.0\n10', output: '1024.0000', orderIndex: 0 }],
    testCases: [
      { input: '2.0\n10', expectedOutput: '1024.0000', isHidden: false, orderIndex: 0 },
      { input: '2.1\n3', expectedOutput: '9.2610', isHidden: false, orderIndex: 1 },
      { input: '2.0\n-2', expectedOutput: '0.2500', isHidden: true, orderIndex: 2 },
    ],
    starterCode: {
      python: `import sys\nlines = sys.stdin.read().split('\\n')\nx = float(lines[0]); n = int(lines[1])\nprint(f"{x**n:.4f}")\n`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').split('\\n');\nconst x = parseFloat(lines[0]), n = parseInt(lines[1]);\nconsole.log(Math.pow(x, n).toFixed(4));\n`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        double x = sc.nextDouble(); int n = sc.nextInt();\n        System.out.printf(Locale.US, "%.4f\\n", Math.pow(x, n));\n    }\n}\n`,
    },
  },

  // ── MEDIUM ────────────────────────────────────────────────────────────────────
  {
    slug: 'generate-all-subsets',
    title: 'Subsets Generation (Power Set)',
    difficulty: 'Medium',
    category: 'Backtracking',
    tier: 'mid',
    acceptanceRate: 74.2,
    description: 'Given an array of unique integers, return all possible subsets (the power set). Output each subset space-separated on its own line, sorted by subset size then elements.',
    constraints: '- `1 <= nums.length <= 10`\n- `-10 <= nums[i] <= 10`',
    examples: [{ input: '1 2 3', output: '\n1\n2\n3\n1 2\n1 3\n2 3\n1 2 3', orderIndex: 0 }],
    testCases: [
      { input: '1 2 3', expectedOutput: '\n1\n2\n3\n1 2\n1 3\n2 3\n1 2 3', isHidden: false, orderIndex: 0 },
      { input: '0', expectedOutput: '\n0', isHidden: false, orderIndex: 1 },
    ],
    starterCode: {
      python: `import sys\nnums = sorted(map(int, sys.stdin.read().split()))\nres = [[]]\nfor x in nums:\n    res += [curr + [x] for curr in res]\nres.sort(key=lambda s: (len(s), s))\nfor s in res: print(*s)\n`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').split('\\n');\nconst nums = lines[0].split(' ').map(Number).sort((a,b)=>a-b);\nlet res = [[]];\nfor (const x of nums) { res = [...res, ...res.map(c => [...c, x])]; }\nres.sort((a,b) => a.length - b.length || a.join().localeCompare(b.join()));\nres.forEach(s => console.log(s.join(' ')));\n`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int[] nums = Arrays.stream(sc.nextLine().split(" ")).mapToInt(Integer::parseInt).sorted().toArray();\n        List<List<Integer>> res = new ArrayList<>();\n        res.add(new ArrayList<>());\n        for (int x : nums) {\n            int sz = res.size();\n            for (int i=0; i<sz; i++) {\n                List<Integer> c = new ArrayList<>(res.get(i)); c.add(x);\n                res.add(c);\n            }\n        }\n        res.sort(Comparator.comparingInt(List::size));\n        for (List<Integer> s : res) {\n            StringBuilder sb = new StringBuilder();\n            for (int i=0; i<s.size(); i++) sb.append(s.get(i)).append(i<s.size()-1?" ":"");\n            System.out.println(sb);\n        }\n    }\n}\n`,
    },
  },
  {
    slug: 'combination-sum-problem',
    title: 'Combination Sum',
    difficulty: 'Medium',
    category: 'Backtracking',
    tier: 'mid',
    acceptanceRate: 69.1,
    description: 'Given an array of distinct integers `candidates` and a `target`, return all unique combinations where candidate numbers sum to `target`. Same candidate may be chosen unlimited times. Line 1: array, Line 2: target.',
    constraints: '- `1 <= candidates.length <= 30`\n- `1 <= target <= 500`',
    examples: [{ input: '2 3 6 7\n7', output: '2 2 3\n7', orderIndex: 0 }],
    testCases: [
      { input: '2 3 6 7\n7', expectedOutput: '2 2 3\n7', isHidden: false, orderIndex: 0 },
      { input: '2 3 5\n8', expectedOutput: '2 2 2 2\n2 3 3\n3 5', isHidden: false, orderIndex: 1 },
    ],
    starterCode: {
      python: `import sys\nlines = sys.stdin.read().split('\\n')\ncands = sorted(map(int, lines[0].split()))\ntarget = int(lines[1])\nres = []\ndef backtrack(idx, curr, remain):\n    if remain == 0: res.append(list(curr)); return\n    for i in range(idx, len(cands)):\n        if cands[i] > remain: break\n        backtrack(i, curr + [cands[i]], remain - cands[i])\nbacktrack(0, [], target)\nfor comb in res: print(*comb)\n`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').split('\\n');\nconst cands = lines[0].split(' ').map(Number).sort((a,b)=>a-b);\nconst target = Number(lines[1]);\nconst res = [];\nfunction bt(idx, curr, rem) {\n  if (rem === 0) { res.push([...curr]); return; }\n  for (let i = idx; i < cands.length; i++) {\n    if (cands[i] > rem) break;\n    bt(i, [...curr, cands[i]], rem - cands[i]);\n  }\n}\nbt(0, [], target);\nres.forEach(c => console.log(c.join(' ')));\n`,
      java: `import java.util.*;\npublic class Main {\n    static int[] cands; static List<List<Integer>> res = new ArrayList<>();\n    static void bt(int idx, List<Integer> curr, int rem) {\n        if (rem == 0) { res.add(new ArrayList<>(curr)); return; }\n        for (int i=idx; i<cands.length; i++) {\n            if (cands[i] > rem) break;\n            curr.add(cands[i]); bt(i, curr, rem - cands[i]); curr.remove(curr.size()-1);\n        }\n    }\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        cands = Arrays.stream(sc.nextLine().split(" ")).mapToInt(Integer::parseInt).sorted().toArray();\n        int target = sc.nextInt();\n        bt(0, new ArrayList<>(), target);\n        for (List<Integer> c : res) {\n            StringBuilder sb = new StringBuilder();\n            for (int i=0; i<c.size(); i++) sb.append(c.get(i)).append(i<c.size()-1?" ":"");\n            System.out.println(sb);\n        }\n    }\n}\n`,
    },
  },

  // ── HARD ─────────────────────────────────────────────────────────────────────
  {
    slug: 'n-queens-problem',
    title: 'N-Queens Solution Count',
    difficulty: 'Hard',
    category: 'Backtracking',
    tier: 'pro',
    acceptanceRate: 59.8,
    description: 'The `n`-queens puzzle is the problem of placing `n` queens on an `n x n` chessboard such that no two queens attack each other. Given integer `n`, return the total number of distinct solutions.',
    constraints: '- `1 <= n <= 9`',
    examples: [{ input: '4', output: '2', orderIndex: 0 }],
    testCases: [
      { input: '4', expectedOutput: '2', isHidden: false, orderIndex: 0 },
      { input: '1', expectedOutput: '1', isHidden: false, orderIndex: 1 },
      { input: '8', expectedOutput: '92', isHidden: true, orderIndex: 2 },
    ],
    starterCode: {
      python: `import sys\nn = int(sys.stdin.read().strip())\ncols, diag1, diag2 = set(), set(), set()\ndef solve(r):\n    if r == n: return 1\n    cnt = 0\n    for c in range(n):\n        if c in cols or (r-c) in diag1 or (r+c) in diag2: continue\n        cols.add(c); diag1.add(r-c); diag2.add(r+c)\n        cnt += solve(r+1)\n        cols.remove(c); diag1.remove(r-c); diag2.remove(r+c)\n    return cnt\nprint(solve(0))\n`,
      javascript: `const n = parseInt(require('fs').readFileSync('/dev/stdin','utf8').trim());\nlet cols = new Set(), d1 = new Set(), d2 = new Set();\nfunction solve(r) {\n  if (r === n) return 1;\n  let count = 0;\n  for (let c = 0; c < n; c++) {\n    if (cols.has(c) || d1.has(r-c) || d2.has(r+c)) continue;\n    cols.add(c); d1.add(r-c); d2.add(r+c);\n    count += solve(r+1);\n    cols.delete(c); d1.delete(r-c); d2.delete(r+c);\n  }\n  return count;\n}\nconsole.log(solve(0));\n`,
      java: `import java.util.*;\npublic class Main {\n    static int n;\n    static Set<Integer> cols = new HashSet<>(), d1 = new HashSet<>(), d2 = new HashSet<>();\n    static int solve(int r) {\n        if (r == n) return 1;\n        int cnt = 0;\n        for (int c = 0; c < n; c++) {\n            if (cols.contains(c) || d1.contains(r-c) || d2.contains(r+c)) continue;\n            cols.add(c); d1.add(r-c); d2.add(r+c);\n            cnt += solve(r+1);\n            cols.remove(c); d1.remove(r-c); d2.remove(r+c);\n        }\n        return cnt;\n    }\n    public static void main(String[] args) {\n        n = new Scanner(System.in).nextInt();\n        System.out.println(solve(0));\n    }\n}\n`,
    },
  },
];
