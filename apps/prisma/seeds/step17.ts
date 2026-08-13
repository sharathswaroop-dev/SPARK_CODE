/**
 * Step 17: Advanced Dynamic Programming — Easy / Medium / Hard
 * Tier: Easy → 'free' | Medium → 'mid' | Hard → 'pro'
 */
export const step17Problems = [
  // ── EASY ────────────────────────────────────────────────────────────────────
  {
    slug: 'house-robber-dp',
    title: 'House Robber',
    difficulty: 'Easy',
    category: 'Dynamic Programming',
    tier: 'free',
    acceptanceRate: 85.5,
    description: 'You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed. Adjacent houses have security systems connected — return the maximum amount of money you can rob tonight without alerting the police.',
    constraints: '- `1 <= nums.length <= 100`\n- `0 <= nums[i] <= 400`',
    examples: [{ input: '1 2 3 1', output: '4', orderIndex: 0 }],
    testCases: [
      { input: '1 2 3 1', expectedOutput: '4', isHidden: false, orderIndex: 0 },
      { input: '2 7 9 3 1', expectedOutput: '12', isHidden: false, orderIndex: 1 },
    ],
    starterCode: {
      python: `import sys\nnums = list(map(int, sys.stdin.read().split()))\nprev1 = prev2 = 0\nfor x in nums:\n    prev1, prev2 = max(prev2 + x, prev1), prev1\nprint(prev1)\n`,
      javascript: `const nums = require('fs').readFileSync('/dev/stdin','utf8').split(' ').map(Number);\nlet p1 = 0, p2 = 0;\nnums.forEach(x => { const tmp = Math.max(p2 + x, p1); p2 = p1; p1 = tmp; });\nconsole.log(p1);\n`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int p1 = 0, p2 = 0;\n        while(sc.hasNextInt()) {\n            int x = sc.nextInt();\n            int tmp = Math.max(p2 + x, p1);\n            p2 = p1; p1 = tmp;\n        }\n        System.out.println(p1);\n    }\n}\n`,
    },
  },

  // ── MEDIUM ────────────────────────────────────────────────────────────────────
  {
    slug: 'longest-increasing-subsequence',
    title: 'Longest Increasing Subsequence (LIS)',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    tier: 'mid',
    acceptanceRate: 69.8,
    description: 'Given an integer array `nums`, return the length of the longest strictly increasing subsequence.',
    constraints: '- `1 <= nums.length <= 2500`\n- `-10^4 <= nums[i] <= 10^4`',
    examples: [{ input: '10 9 2 5 3 7 101 18', output: '4', explanation: '[2, 3, 7, 101] has length 4', orderIndex: 0 }],
    testCases: [
      { input: '10 9 2 5 3 7 101 18', expectedOutput: '4', isHidden: false, orderIndex: 0 },
      { input: '0 1 0 3 2 3', expectedOutput: '4', isHidden: false, orderIndex: 1 },
      { input: '7 7 7 7', expectedOutput: '1', isHidden: true, orderIndex: 2 },
    ],
    starterCode: {
      python: `import sys, bisect\nnums = list(map(int, sys.stdin.read().split()))\nsub = []\nfor x in nums:\n    idx = bisect.bisect_left(sub, x)\n    if idx == len(sub): sub.append(x)\n    else: sub[idx] = x\nprint(len(sub))\n`,
      javascript: `const nums = require('fs').readFileSync('/dev/stdin','utf8').split(' ').map(Number);\nconst sub = [];\nnums.forEach(x => {\n  let lo = 0, hi = sub.length;\n  while(lo < hi) { const mid = (lo + hi) >> 1; if(sub[mid] < x) lo = mid + 1; else hi = mid; }\n  if(lo === sub.length) sub.push(x); else sub[lo] = x;\n});\nconsole.log(sub.length);\n`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int[] nums = Arrays.stream(sc.nextLine().split(" ")).mapToInt(Integer::parseInt).toArray();\n        List<Integer> sub = new ArrayList<>();\n        for(int x : nums) {\n            int idx = Collections.binarySearch(sub, x);\n            if(idx < 0) idx = -(idx + 1);\n            if(idx == sub.size()) sub.add(x); else sub.set(idx, x);\n        }\n        System.out.println(sub.size());\n    }\n}\n`,
    },
  },

  // ── HARD ─────────────────────────────────────────────────────────────────────
  {
    slug: 'burst-balloons-mcm-dp',
    title: 'Burst Balloons (Matrix Chain Multiplication DP)',
    difficulty: 'Hard',
    category: 'Dynamic Programming',
    tier: 'pro',
    acceptanceRate: 58.1,
    description: 'Given `n` balloons indexed from `0` to `n-1`. Each balloon is painted with a number represented by array `nums`. You are asked to burst all the balloons. If you burst balloon `i`, you gain `nums[i-1] * nums[i] * nums[i+1]` coins. Return the maximum coins you can collect.',
    constraints: '- `1 <= n <= 300`\n- `0 <= nums[i] <= 100`',
    examples: [{ input: '3 1 5 8', output: '167', orderIndex: 0 }],
    testCases: [
      { input: '3 1 5 8', expectedOutput: '167', isHidden: false, orderIndex: 0 },
      { input: '1 5', expectedOutput: '10', isHidden: false, orderIndex: 1 },
    ],
    starterCode: {
      python: `import sys\nnums = [1] + list(map(int, sys.stdin.read().split())) + [1]\nn = len(nums)\ndp = [[0]*n for _ in range(n)]\nfor length in range(2, n):\n    for left in range(0, n - length):\n        right = left + length\n        for i in range(left + 1, right):\n            dp[left][right] = max(dp[left][right], nums[left]*nums[i]*nums[right] + dp[left][i] + dp[i][right])\nprint(dp[0][n-1])\n`,
      javascript: `const raw = require('fs').readFileSync('/dev/stdin','utf8').split(' ').map(Number);\nconst nums = [1, ...raw, 1];\nconst n = nums.length;\nconst dp = Array.from({length: n}, () => new Array(n).fill(0));\nfor(let len=2; len<n; len++) {\n  for(let l=0; l<n-len; l++) {\n    const r = l + len;\n    for(let i=l+1; i<r; i++) {\n      dp[l][r] = Math.max(dp[l][r], nums[l]*nums[i]*nums[r] + dp[l][i] + dp[i][r]);\n    }\n  }\n}\nconsole.log(dp[0][n-1]);\n`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int[] raw = Arrays.stream(sc.nextLine().split(" ")).mapToInt(Integer::parseInt).toArray();\n        int n = raw.length + 2;\n        int[] nums = new int[n]; nums[0] = 1; nums[n-1] = 1;\n        System.arraycopy(raw, 0, nums, 1, raw.length);\n        int[][] dp = new int[n][n];\n        for(int len=2; len<n; len++) {\n            for(int l=0; l<n-len; l++) {\n                int r = l + len;\n                for(int i=l+1; i<r; i++) {\n                    dp[l][r] = Math.max(dp[l][r], nums[l]*nums[i]*nums[r] + dp[l][i] + dp[i][r]);\n                }\n            }\n        }\n        System.out.println(dp[0][n-1]);\n    }\n}\n`,
    },
  },
];
