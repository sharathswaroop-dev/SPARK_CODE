/**
 * Step 10: Trees & Binary Search Trees — Easy / Medium / Hard
 * Tier: Easy → 'free' | Medium → 'mid' | Hard → 'pro'
 */
export const step10Problems = [
  // ── EASY ────────────────────────────────────────────────────────────────────
  {
    slug: 'max-depth-binary-tree',
    title: 'Maximum Depth of Binary Tree',
    difficulty: 'Easy',
    category: 'Tree',
    tier: 'free',
    acceptanceRate: 84.1,
    description: 'Given the level-order traversal of a binary tree as space-separated integers (use -1 for null), return its maximum depth.',
    constraints: '- `0 <= node count <= 10^4`\n- `-100 <= Node.val <= 100`',
    examples: [{ input: '3 9 20 -1 -1 15 7', output: '3', orderIndex: 0 }],
    testCases: [
      { input: '3 9 20 -1 -1 15 7', expectedOutput: '3', isHidden: false, orderIndex: 0 },
      { input: '1 -1 2', expectedOutput: '2', isHidden: false, orderIndex: 1 },
      { input: '-1', expectedOutput: '0', isHidden: true, orderIndex: 2 },
    ],
    starterCode: {
      python: `import sys\nvals = list(map(int, sys.stdin.read().split()))\nif not vals or vals[0] == -1: print(0); exit()\nfrom collections import deque\nq = deque([(0, 1)])\nmax_d = 0\nwhile q:\n    idx, d = q.popleft()\n    if idx >= len(vals) or vals[idx] == -1: continue\n    max_d = max(max_d, d)\n    q.append((2*idx+1, d+1))\n    q.append((2*idx+2, d+1))\nprint(max_d)\n`,
      javascript: `const vals = require('fs').readFileSync('/dev/stdin','utf8').split(' ').map(Number);\nif (!vals.length || vals[0] === -1) { console.log(0); process.exit(); }\nlet maxD = 0;\nconst q = [[0, 1]];\nwhile(q.length) {\n  const [idx, d] = q.shift();\n  if (idx >= vals.length || vals[idx] === -1) continue;\n  maxD = Math.max(maxD, d);\n  q.push([2*idx+1, d+1]);\n  q.push([2*idx+2, d+1]);\n}\nconsole.log(maxD);\n`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        List<Integer> vals = new ArrayList<>();\n        while(sc.hasNextInt()) vals.add(sc.nextInt());\n        if (vals.isEmpty() || vals.get(0) == -1) { System.out.println(0); return; }\n        Queue<int[]> q = new LinkedList<>();\n        q.add(new int[]{0, 1});\n        int maxD = 0;\n        while(!q.isEmpty()) {\n            int[] curr = q.poll(); int idx = curr[0], d = curr[1];\n            if (idx >= vals.size() || vals.get(idx) == -1) continue;\n            maxD = Math.max(maxD, d);\n            q.add(new int[]{2*idx+1, d+1});\n            q.add(new int[]{2*idx+2, d+1});\n        }\n        System.out.println(maxD);\n    }\n}\n`,
    },
  },
  {
    slug: 'inorder-traversal-tree',
    title: 'Binary Tree Inorder Traversal',
    difficulty: 'Easy',
    category: 'Tree',
    tier: 'free',
    acceptanceRate: 86.9,
    description: 'Given the array representation of a binary tree (-1 for null), return the in-order traversal of its nodes\' values as space-separated integers.',
    constraints: '- `0 <= node count <= 100`',
    examples: [{ input: '1 -1 2 3', output: '1 3 2', orderIndex: 0 }],
    testCases: [
      { input: '1 -1 2 3', expectedOutput: '1 3 2', isHidden: false, orderIndex: 0 },
      { input: '1', expectedOutput: '1', isHidden: false, orderIndex: 1 },
    ],
    starterCode: {
      python: `import sys\nvals = list(map(int, sys.stdin.read().split()))\nres = []\ndef inorder(idx):\n    if idx >= len(vals) or vals[idx] == -1: return\n    inorder(2*idx+1)\n    res.append(vals[idx])\n    inorder(2*idx+2)\ninorder(0)\nprint(*res)\n`,
      javascript: `const vals = require('fs').readFileSync('/dev/stdin','utf8').split(' ').map(Number);\nconst res = [];\nfunction inorder(i) {\n  if (i >= vals.length || vals[i] === -1) return;\n  inorder(2*i+1);\n  res.push(vals[i]);\n  inorder(2*i+2);\n}\ninorder(0);\nconsole.log(res.join(' '));\n`,
      java: `import java.util.*;\npublic class Main {\n    static List<Integer> vals = new ArrayList<>(), res = new ArrayList<>();\n    static void inorder(int i) {\n        if (i >= vals.size() || vals.get(i) == -1) return;\n        inorder(2*i+1);\n        res.add(vals.get(i));\n        inorder(2*i+2);\n    }\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        while(sc.hasNextInt()) vals.add(sc.nextInt());\n        inorder(0);\n        StringBuilder sb = new StringBuilder();\n        for(int i=0; i<res.size(); i++) sb.append(res.get(i)).append(i<res.size()-1?" ":"");\n        System.out.println(sb);\n    }\n}\n`,
    },
  },

  // ── MEDIUM ────────────────────────────────────────────────────────────────────
  {
    slug: 'validate-bst-check',
    title: 'Validate Binary Search Tree',
    difficulty: 'Medium',
    category: 'Tree',
    tier: 'mid',
    acceptanceRate: 70.4,
    description: 'Given an array representation of a binary tree (-1 for null), determine if it is a valid Binary Search Tree (BST). Output true or false.',
    constraints: '- `1 <= node count <= 10^4`\n- `-2^31 <= Node.val <= 2^31 - 1`',
    examples: [{ input: '2 1 3', output: 'true', orderIndex: 0 }],
    testCases: [
      { input: '2 1 3', expectedOutput: 'true', isHidden: false, orderIndex: 0 },
      { input: '5 1 4 -1 -1 3 6', expectedOutput: 'false', isHidden: false, orderIndex: 1 },
    ],
    starterCode: {
      python: `import sys\nvals = list(map(int, sys.stdin.read().split()))\ndef is_bst(idx, lo, hi):\n    if idx >= len(vals) or vals[idx] == -1: return True\n    v = vals[idx]\n    if v <= lo or v >= hi: return False\n    return is_bst(2*idx+1, lo, v) and is_bst(2*idx+2, v, hi)\nprint(str(is_bst(0, float('-inf'), float('inf'))).lower())\n`,
      javascript: `const vals = require('fs').readFileSync('/dev/stdin','utf8').split(' ').map(Number);\nfunction isBst(i, lo, hi) {\n  if (i >= vals.length || vals[i] === -1) return true;\n  const v = vals[i];\n  if (v <= lo || v >= hi) return false;\n  return isBst(2*i+1, lo, v) && isBst(2*i+2, v, hi);\n}\nconsole.log(isBst(0, -Infinity, Infinity));\n`,
      java: `import java.util.*;\npublic class Main {\n    static List<Integer> vals = new ArrayList<>();\n    static boolean isBst(int i, long lo, long hi) {\n        if (i >= vals.size() || vals.get(i) == -1) return true;\n        long v = vals.get(i);\n        if (v <= lo || v >= hi) return false;\n        return isBst(2*i+1, lo, v) && isBst(2*i+2, v, hi);\n    }\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        while(sc.hasNextInt()) vals.add(sc.nextInt());\n        System.out.println(isBst(0, Long.MIN_VALUE, Long.MAX_VALUE));\n    }\n}\n`,
    },
  },
];
