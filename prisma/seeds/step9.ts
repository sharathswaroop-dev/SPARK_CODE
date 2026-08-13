/**
 * Step 9: Stack & Queue — Easy / Medium / Hard
 * Tier: Easy → 'free' | Medium → 'mid' | Hard → 'pro'
 */
export const step9Problems = [
  // ── EASY ────────────────────────────────────────────────────────────────────
  {
    slug: 'valid-parentheses-check',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    category: 'Stack',
    tier: 'free',
    acceptanceRate: 86.5,
    description: 'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid (brackets must close in correct order).',
    constraints: '- `1 <= s.length <= 10^4`\n- `s` consists of parentheses only',
    examples: [{ input: '()[]{}', output: 'true', orderIndex: 0 }],
    testCases: [
      { input: '()[]{}', expectedOutput: 'true', isHidden: false, orderIndex: 0 },
      { input: '(]', expectedOutput: 'false', isHidden: false, orderIndex: 1 },
      { input: '{[]}', expectedOutput: 'true', isHidden: true, orderIndex: 2 },
    ],
    starterCode: {
      python: `import sys\ns = sys.stdin.read().strip()\nstk = []\npairs = {')':'(', '}':'{', ']':'['}\nfor c in s:\n    if c in pairs:\n        if not stk or stk.pop() != pairs[c]: print("false"); exit()\n    else: stk.append(c)\nprint(str(len(stk) == 0).lower())\n`,
      javascript: `const s = require('fs').readFileSync('/dev/stdin','utf8').trim();\nconst stk = [], pairs = {')':'(', '}':'{', ']':'['};\nfor(const c of s) {\n  if(pairs[c]) { if(!stk.length || stk.pop() !== pairs[c]) { console.log("false"); process.exit(); } }\n  else stk.push(c);\n}\nconsole.log(stk.length === 0);\n`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        String s = new Scanner(System.in).nextLine().trim();\n        Stack<Character> stk = new Stack<>();\n        for(char c : s.toCharArray()) {\n            if(c == ')') { if(stk.isEmpty() || stk.pop() != '(') { System.out.println(false); return; } }\n            else if(c == '}') { if(stk.isEmpty() || stk.pop() != '{') { System.out.println(false); return; } }\n            else if(c == ']') { if(stk.isEmpty() || stk.pop() != '[') { System.out.println(false); return; } }\n            else stk.push(c);\n        }\n        System.out.println(stk.isEmpty());\n    }\n}\n`,
    },
  },

  // ── MEDIUM ────────────────────────────────────────────────────────────────────
  {
    slug: 'next-greater-element-stack',
    title: 'Next Greater Element',
    difficulty: 'Medium',
    category: 'Stack',
    tier: 'mid',
    acceptanceRate: 72.8,
    description: 'Given an array `nums`, return an array of next greater elements for each element. If no greater element exists, use -1. Print space-separated values.',
    constraints: '- `1 <= nums.length <= 10^4`\n- `-10^9 <= nums[i] <= 10^9`',
    examples: [{ input: '4 5 2 25', output: '5 25 25 -1', orderIndex: 0 }],
    testCases: [
      { input: '4 5 2 25', expectedOutput: '5 25 25 -1', isHidden: false, orderIndex: 0 },
      { input: '13 7 6 12', expectedOutput: '-1 12 12 -1', isHidden: false, orderIndex: 1 },
    ],
    starterCode: {
      python: `import sys\nnums = list(map(int, sys.stdin.read().split()))\nn = len(nums)\nres = [-1] * n\nstk = []\nfor i in range(n-1, -1, -1):\n    while stk and stk[-1] <= nums[i]: stk.pop()\n    if stk: res[i] = stk[-1]\n    stk.append(nums[i])\nprint(*res)\n`,
      javascript: `const nums = require('fs').readFileSync('/dev/stdin','utf8').split(' ').map(Number);\nconst n = nums.length, res = new Array(n).fill(-1), stk = [];\nfor(let i=n-1; i>=0; i--) {\n  while(stk.length && stk[stk.length-1] <= nums[i]) stk.pop();\n  if(stk.length) res[i] = stk[stk.length-1];\n  stk.push(nums[i]);\n}\nconsole.log(res.join(' '));\n`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int[] nums = Arrays.stream(sc.nextLine().split(" ")).mapToInt(Integer::parseInt).toArray();\n        int n = nums.length;\n        int[] res = new int[n]; Arrays.fill(res, -1);\n        Stack<Integer> stk = new Stack<>();\n        for(int i=n-1; i>=0; i--) {\n            while(!stk.isEmpty() && stk.peek() <= nums[i]) stk.pop();\n            if(!stk.isEmpty()) res[i] = stk.peek();\n            stk.push(nums[i]);\n        }\n        StringBuilder sb = new StringBuilder();\n        for(int i=0; i<n; i++) sb.append(res[i]).append(i<n-1?" ":"");\n        System.out.println(sb);\n    }\n}\n`,
    },
  },

  // ── HARD ─────────────────────────────────────────────────────────────────────
  {
    slug: 'largest-rectangle-histogram',
    title: 'Largest Rectangle in Histogram',
    difficulty: 'Hard',
    category: 'Stack',
    tier: 'pro',
    acceptanceRate: 52.1,
    description: 'Given an array of integers `heights` representing the histogram\'s bar height where the width of each bar is 1, return the area of the largest rectangle in the histogram.',
    constraints: '- `1 <= heights.length <= 10^5`\n- `0 <= heights[i] <= 10^4`',
    examples: [{ input: '2 1 5 6 2 3', output: '10', orderIndex: 0 }],
    testCases: [
      { input: '2 1 5 6 2 3', expectedOutput: '10', isHidden: false, orderIndex: 0 },
      { input: '2 4', expectedOutput: '4', isHidden: false, orderIndex: 1 },
    ],
    starterCode: {
      python: `import sys\nh = list(map(int, sys.stdin.read().split()))\nstk = []; max_area = 0; n = len(h)\nfor i in range(n + 1):\n    curr_h = h[i] if i < n else 0\n    while stk and h[stk[-1]] >= curr_h:\n        height = h[stk.pop()]\n        width = i if not stk else i - stk[-1] - 1\n        max_area = max(max_area, height * width)\n    stk.append(i)\nprint(max_area)\n`,
      javascript: `const h = require('fs').readFileSync('/dev/stdin','utf8').split(' ').map(Number);\nlet maxArea = 0, stk = [], n = h.length;\nfor(let i=0; i<=n; i++) {\n  const currH = i < n ? h[i] : 0;\n  while(stk.length && h[stk[stk.length-1]] >= currH) {\n    const height = h[stk.pop()];\n    const width = stk.length === 0 ? i : i - stk[stk.length-1] - 1;\n    maxArea = Math.max(maxArea, height * width);\n  }\n  stk.push(i);\n}\nconsole.log(maxArea);\n`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int[] h = Arrays.stream(sc.nextLine().split(" ")).mapToInt(Integer::parseInt).toArray();\n        int n = h.length, maxArea = 0;\n        Stack<Integer> stk = new Stack<>();\n        for(int i=0; i<=n; i++) {\n            int currH = i < n ? h[i] : 0;\n            while(!stk.isEmpty() && h[stk.peek()] >= currH) {\n                int height = h[stk.pop()];\n                int width = stk.isEmpty() ? i : i - stk.peek() - 1;\n                maxArea = Math.max(maxArea, height * width);\n            }\n            stk.push(i);\n        }\n        System.out.println(maxArea);\n    }\n}\n`,
    },
  },
];
