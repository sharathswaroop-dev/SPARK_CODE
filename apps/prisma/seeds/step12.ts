/**
 * Step 12: Dynamic Programming — Easy / Medium / Hard
 * Tier: Easy → 'free' | Medium → 'mid' | Hard → 'pro'
 */
export const step12Problems = [
  // ── EASY ────────────────────────────────────────────────────────────────────
  {
    slug: 'climbing-stairs-dp',
    title: 'Climbing Stairs',
    difficulty: 'Easy',
    category: 'Dynamic Programming',
    tier: 'free',
    acceptanceRate: 85.9,
    description: 'You are climbing a staircase with `n` steps. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
    constraints: '- `1 <= n <= 45`',
    examples: [{ input: '3', output: '3', orderIndex: 0 }],
    testCases: [
      { input: '3', expectedOutput: '3', isHidden: false, orderIndex: 0 },
      { input: '2', expectedOutput: '2', isHidden: false, orderIndex: 1 },
      { input: '5', expectedOutput: '8', isHidden: true, orderIndex: 2 },
    ],
    starterCode: {
      python: `import sys\nn = int(sys.stdin.read().strip())\na, b = 1, 1\nfor _ in range(n-1):\n    a, b = b, a + b\nprint(b)\n`,
      javascript: `const n = parseInt(require('fs').readFileSync('/dev/stdin','utf8').trim());\nlet a = 1, b = 1;\nfor(let i=1; i<n; i++) { const t = a + b; a = b; b = t; }\nconsole.log(b);\n`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int a = 1, b = 1;\n        for(int i=1; i<n; i++) { int t = a + b; a = b; b = t; }\n        System.out.println(b);\n    }\n}\n`,
    },
  },

  // ── MEDIUM ────────────────────────────────────────────────────────────────────
  {
    slug: 'coin-change-dp',
    title: 'Coin Change Minimum Coins',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    tier: 'mid',
    acceptanceRate: 68.2,
    description: 'Given an array of integer coins and an integer amount, return the fewest number of coins needed to make up that amount. If impossible, return -1. Line 1: coins, Line 2: amount.',
    constraints: '- `1 <= coins.length <= 12`\n- `1 <= coins[i] <= 2^31 - 1`\n- `0 <= amount <= 10^4`',
    examples: [{ input: '1 2 5\n11', output: '3', orderIndex: 0 }],
    testCases: [
      { input: '1 2 5\n11', expectedOutput: '3', isHidden: false, orderIndex: 0 },
      { input: '2\n3', expectedOutput: '-1', isHidden: false, orderIndex: 1 },
      { input: '1\n0', expectedOutput: '0', isHidden: true, orderIndex: 2 },
    ],
    starterCode: {
      python: `import sys\nlines = sys.stdin.read().split('\\n')\ncoins = list(map(int, lines[0].split()))\namount = int(lines[1])\ndp = [float('inf')] * (amount + 1)\ndp[0] = 0\nfor i in range(1, amount + 1):\n    for c in coins:\n        if i >= c: dp[i] = min(dp[i], dp[i-c] + 1)\nprint(dp[amount] if dp[amount] != float('inf') else -1)\n`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').split('\\n');\nconst coins = lines[0].split(' ').map(Number);\nconst amount = Number(lines[1]);\nconst dp = new Array(amount + 1).fill(Infinity);\ndp[0] = 0;\nfor(let i=1; i<=amount; i++) {\n  for(const c of coins) if(i >= c) dp[i] = Math.min(dp[i], dp[i-c] + 1);\n}\nconsole.log(dp[amount] === Infinity ? -1 : dp[amount]);\n`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int[] coins = Arrays.stream(sc.nextLine().split(" ")).mapToInt(Integer::parseInt).toArray();\n        int amount = sc.nextInt();\n        int[] dp = new int[amount + 1]; Arrays.fill(dp, amount + 1); dp[0] = 0;\n        for(int i=1; i<=amount; i++) {\n            for(int c : coins) if(i >= c) dp[i] = Math.min(dp[i], dp[i-c] + 1);\n        }\n        System.out.println(dp[amount] > amount ? -1 : dp[amount]);\n    }\n}\n`,
    },
  },
  {
    slug: 'longest-common-subsequence-dp',
    title: 'Longest Common Subsequence',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    tier: 'mid',
    acceptanceRate: 66.7,
    description: 'Given two strings `text1` and `text2`, return the length of their longest common subsequence. Line 1: `text1`, Line 2: `text2`.',
    constraints: '- `1 <= text1.length, text2.length <= 1000`',
    examples: [{ input: 'abcde\nace', output: '3', orderIndex: 0 }],
    testCases: [
      { input: 'abcde\nace', expectedOutput: '3', isHidden: false, orderIndex: 0 },
      { input: 'abc\nabc', expectedOutput: '3', isHidden: false, orderIndex: 1 },
      { input: 'abc\ndef', expectedOutput: '0', isHidden: true, orderIndex: 2 },
    ],
    starterCode: {
      python: `import sys\nlines = sys.stdin.read().split('\\n')\ns1, s2 = lines[0].strip(), lines[1].strip()\nm, n = len(s1), len(s2)\ndp = [[0]*(n+1) for _ in range(m+1)]\nfor i in range(1, m+1):\n    for j in range(1, n+1):\n        if s1[i-1] == s2[j-1]: dp[i][j] = dp[i-1][j-1] + 1\n        else: dp[i][j] = max(dp[i-1][j], dp[i][j-1])\nprint(dp[m][n])\n`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').split('\\n');\nconst s1 = lines[0].trim(), s2 = lines[1].trim();\nconst m = s1.length, n = s2.length;\nconst dp = Array.from({length: m+1}, () => new Array(n+1).fill(0));\nfor(let i=1; i<=m; i++) {\n  for(let j=1; j<=n; j++) {\n    if (s1[i-1] === s2[j-1]) dp[i][j] = dp[i-1][j-1] + 1;\n    else dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);\n  }\n}\nconsole.log(dp[m][n]);\n`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s1 = sc.nextLine().trim(), s2 = sc.nextLine().trim();\n        int m = s1.length(), n = s2.length();\n        int[][] dp = new int[m+1][n+1];\n        for(int i=1; i<=m; i++) {\n            for(int j=1; j<=n; j++) {\n                if (s1.charAt(i-1) == s2.charAt(j-1)) dp[i][j] = dp[i-1][j-1] + 1;\n                else dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);\n            }\n        }\n        System.out.println(dp[m][n]);\n    }\n}\n`,
    },
  },

  // ── HARD ─────────────────────────────────────────────────────────────────────
  {
    slug: 'edit-distance-dp',
    title: 'Edit Distance (Levenshtein)',
    difficulty: 'Hard',
    category: 'Dynamic Programming',
    tier: 'pro',
    acceptanceRate: 55.4,
    description: 'Given two strings `word1` and `word2`, return the minimum number of operations required to convert `word1` to `word2`. Permitted operations: insert, delete, replace character. Line 1: `word1`, Line 2: `word2`.',
    constraints: '- `0 <= word1.length, word2.length <= 500`',
    examples: [{ input: 'horse\nros', output: '3', orderIndex: 0 }],
    testCases: [
      { input: 'horse\nros', expectedOutput: '3', isHidden: false, orderIndex: 0 },
      { input: 'intention\nexecution', expectedOutput: '5', isHidden: false, orderIndex: 1 },
    ],
    starterCode: {
      python: `import sys\nlines = sys.stdin.read().split('\\n')\nw1, w2 = lines[0].strip(), lines[1].strip()\nm, n = len(w1), len(w2)\ndp = [[0]*(n+1) for _ in range(m+1)]\nfor i in range(m+1): dp[i][0] = i\nfor j in range(n+1): dp[0][j] = j\nfor i in range(1, m+1):\n    for j in range(1, n+1):\n        if w1[i-1] == w2[j-1]: dp[i][j] = dp[i-1][j-1]\n        else: dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])\nprint(dp[m][n])\n`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').split('\\n');\nconst w1 = lines[0].trim(), w2 = lines[1].trim();\nconst m = w1.length, n = w2.length;\nconst dp = Array.from({length: m+1}, () => new Array(n+1).fill(0));\nfor(let i=0; i<=m; i++) dp[i][0] = i;\nfor(let j=0; j<=n; j++) dp[0][j] = j;\nfor(let i=1; i<=m; i++) {\n  for(let j=1; j<=n; j++) {\n    if (w1[i-1] === w2[j-1]) dp[i][j] = dp[i-1][j-1];\n    else dp[i][j] = 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);\n  }\n}\nconsole.log(dp[m][n]);\n`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String w1 = sc.hasNextLine() ? sc.nextLine().trim() : "";\n        String w2 = sc.hasNextLine() ? sc.nextLine().trim() : "";\n        int m = w1.length(), n = w2.length();\n        int[][] dp = new int[m+1][n+1];\n        for(int i=0; i<=m; i++) dp[i][0] = i;\n        for(int j=0; j<=n; j++) dp[0][j] = j;\n        for(int i=1; i<=m; i++) {\n            for(int j=1; j<=n; j++) {\n                if (w1.charAt(i-1) == w2.charAt(j-1)) dp[i][j] = dp[i-1][j-1];\n                else dp[i][j] = 1 + Math.min(dp[i-1][j], Math.min(dp[i][j-1], dp[i-1][j-1]));\n            }\n        }\n        System.out.println(dp[m][n]);\n    }\n}\n`,
    },
  },
];
