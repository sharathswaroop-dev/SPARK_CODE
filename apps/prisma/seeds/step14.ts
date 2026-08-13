/**
 * Step 14: Greedy Algorithms — Easy / Medium / Hard
 * Tier: Easy → 'free' | Medium → 'mid' | Hard → 'pro'
 */
export const step14Problems = [
  // ── EASY ────────────────────────────────────────────────────────────────────
  {
    slug: 'assign-cookies-greedy',
    title: 'Assign Cookies to Children',
    difficulty: 'Easy',
    category: 'Greedy',
    tier: 'free',
    acceptanceRate: 85.0,
    description: 'Given greed factors of children `g` and cookie sizes `s`, maximize the number of content children. Line 1: `g` array, Line 2: `s` array.',
    constraints: '- `1 <= g.length, s.length <= 3 * 10^4`',
    examples: [{ input: '1 2 3\n1 1', output: '1', orderIndex: 0 }],
    testCases: [
      { input: '1 2 3\n1 1', expectedOutput: '1', isHidden: false, orderIndex: 0 },
      { input: '1 2\n1 2 3', expectedOutput: '2', isHidden: false, orderIndex: 1 },
    ],
    starterCode: {
      python: `import sys\nlines = sys.stdin.read().split('\\n')\ng = sorted(map(int, lines[0].split()))\ns = sorted(map(int, lines[1].split()))\ni = j = 0\nwhile i < len(g) and j < len(s):\n    if s[j] >= g[i]: i += 1\n    j += 1\nprint(i)\n`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').split('\\n');\nconst g = lines[0].split(' ').map(Number).sort((a,b)=>a-b);\nconst s = lines[1].split(' ').map(Number).sort((a,b)=>a-b);\nlet i=0, j=0;\nwhile(i<g.length && j<s.length) {\n  if (s[j] >= g[i]) i++;\n  j++;\n}\nconsole.log(i);\n`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int[] g = Arrays.stream(sc.nextLine().split(" ")).mapToInt(Integer::parseInt).sorted().toArray();\n        int[] s = Arrays.stream(sc.nextLine().split(" ")).mapToInt(Integer::parseInt).sorted().toArray();\n        int i=0, j=0;\n        while(i<g.length && j<s.length) {\n            if (s[j] >= g[i]) i++;\n            j++;\n        }\n        System.out.println(i);\n    }\n}\n`,
    },
  },

  // ── MEDIUM ────────────────────────────────────────────────────────────────────
  {
    slug: 'jump-game-greedy',
    title: 'Jump Game Reachability',
    difficulty: 'Medium',
    category: 'Greedy',
    tier: 'mid',
    acceptanceRate: 70.1,
    description: 'Given an integer array `nums` where `nums[i]` represents your max jump length at position `i`, return `true` if you can reach the last index, else `false`.',
    constraints: '- `1 <= nums.length <= 10^4`\n- `0 <= nums[i] <= 10^5`',
    examples: [{ input: '2 3 1 1 4', output: 'true', orderIndex: 0 }],
    testCases: [
      { input: '2 3 1 1 4', expectedOutput: 'true', isHidden: false, orderIndex: 0 },
      { input: '3 2 1 0 4', expectedOutput: 'false', isHidden: false, orderIndex: 1 },
    ],
    starterCode: {
      python: `import sys\nnums = list(map(int, sys.stdin.read().split()))\nmax_reach = 0\nfor i, n in enumerate(nums):\n    if i > max_reach: print("false"); exit()\n    max_reach = max(max_reach, i + n)\nprint("true")\n`,
      javascript: `const nums = require('fs').readFileSync('/dev/stdin','utf8').split(' ').map(Number);\nlet maxReach = 0;\nfor(let i=0; i<nums.length; i++) {\n  if(i > maxReach) { console.log(false); process.exit(); }\n  maxReach = Math.max(maxReach, i + nums[i]);\n}\nconsole.log(true);\n`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int[] nums = Arrays.stream(sc.nextLine().split(" ")).mapToInt(Integer::parseInt).toArray();\n        int maxReach = 0;\n        for(int i=0; i<nums.length; i++) {\n            if(i > maxReach) { System.out.println(false); return; }\n            maxReach = Math.max(maxReach, i + nums[i]);\n        }\n        System.out.println(true);\n    }\n}\n`,
    },
  },

  // ── HARD ─────────────────────────────────────────────────────────────────────
  {
    slug: 'n-meetings-one-room',
    title: 'N Meetings in One Room',
    difficulty: 'Hard',
    category: 'Greedy',
    tier: 'pro',
    acceptanceRate: 59.2,
    description: 'There is one meeting room. Given start times `S` and end times `F` of `N` meetings, find the maximum number of meetings that can be performed in the room. Line 1: `S`, Line 2: `F`.',
    constraints: '- `1 <= N <= 10^5`',
    examples: [{ input: '1 3 0 5 8 5\n2 4 6 7 9 9', output: '4', orderIndex: 0 }],
    testCases: [
      { input: '1 3 0 5 8 5\n2 4 6 7 9 9', expectedOutput: '4', isHidden: false, orderIndex: 0 },
      { input: '10 12 20\n20 25 30', expectedOutput: '2', isHidden: false, orderIndex: 1 },
    ],
    starterCode: {
      python: `import sys\nlines = sys.stdin.read().split('\\n')\nstart = list(map(int, lines[0].split()))\nend = list(map(int, lines[1].split()))\nmeetings = sorted(zip(start, end), key=lambda x: x[1])\ncount, last_end = 0, -1\nfor s, e in meetings:\n    if s > last_end:\n        count += 1; last_end = e\nprint(count)\n`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').split('\\n');\nconst start = lines[0].split(' ').map(Number);\nconst end = lines[1].split(' ').map(Number);\nconst meetings = start.map((s, i) => [s, end[i]]).sort((a,b) => a[1] - b[1]);\nlet count = 0, lastEnd = -1;\nfor(const [s, e] of meetings) {\n  if(s > lastEnd) { count++; lastEnd = e; }\n}\nconsole.log(count);\n`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int[] start = Arrays.stream(sc.nextLine().split(" ")).mapToInt(Integer::parseInt).toArray();\n        int[] end = Arrays.stream(sc.nextLine().split(" ")).mapToInt(Integer::parseInt).toArray();\n        int n = start.length;\n        int[][] m = new int[n][2];\n        for(int i=0; i<n; i++) { m[i][0] = start[i]; m[i][1] = end[i]; }\n        Arrays.sort(m, Comparator.comparingInt(a -> a[1]));\n        int count = 0, lastEnd = -1;\n        for(int i=0; i<n; i++) {\n            if(m[i][0] > lastEnd) { count++; lastEnd = m[i][1]; }\n        }\n        System.out.println(count);\n    }\n}\n`,
    },
  },
];
