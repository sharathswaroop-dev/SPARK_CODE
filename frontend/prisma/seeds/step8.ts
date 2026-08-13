/**
 * Step 8: Bit Manipulation — Easy / Medium / Hard
 * Tier: Easy → 'free' | Medium → 'mid' | Hard → 'pro'
 */
export const step8Problems = [
  // ── EASY ────────────────────────────────────────────────────────────────────
  {
    slug: 'single-number-bitwise',
    title: 'Single Number',
    difficulty: 'Easy',
    category: 'Bit Manipulation',
    tier: 'free',
    acceptanceRate: 88.4,
    description: 'Given a non-empty array of integers `nums`, every element appears twice except for one. Find that single one in O(n) time and O(1) space.',
    constraints: '- `1 <= nums.length <= 3 * 10^4`\n- `-3 * 10^4 <= nums[i] <= 3 * 10^4`',
    examples: [{ input: '2 2 1', output: '1', orderIndex: 0 }],
    testCases: [
      { input: '2 2 1', expectedOutput: '1', isHidden: false, orderIndex: 0 },
      { input: '4 1 2 1 2', expectedOutput: '4', isHidden: false, orderIndex: 1 },
      { input: '1', expectedOutput: '1', isHidden: true, orderIndex: 2 },
    ],
    starterCode: {
      python: `import sys, functools, operator\nnums = list(map(int, sys.stdin.read().split()))\nprint(functools.reduce(operator.xor, nums))\n`,
      javascript: `const rl = require('readline').createInterface({ input: process.stdin });\nrl.on('line', l => {\n  console.log(l.split(' ').map(Number).reduce((a, b) => a ^ b, 0));\n  rl.close();\n});\n`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int res = 0;\n        while(sc.hasNextInt()) res ^= sc.nextInt();\n        System.out.println(res);\n    }\n}\n`,
    },
  },
  {
    slug: 'count-set-bits',
    title: 'Number of Set Bits (Hamming Weight)',
    difficulty: 'Easy',
    category: 'Bit Manipulation',
    tier: 'free',
    acceptanceRate: 86.7,
    description: 'Given a positive integer `n`, return the number of set bits (`1`s) in its binary representation.',
    constraints: '- `1 <= n <= 2^31 - 1`',
    examples: [{ input: '11', output: '3', explanation: '11 in binary is 1011 which has 3 set bits', orderIndex: 0 }],
    testCases: [
      { input: '11', expectedOutput: '3', isHidden: false, orderIndex: 0 },
      { input: '128', expectedOutput: '1', isHidden: false, orderIndex: 1 },
      { input: '2147483647', expectedOutput: '31', isHidden: true, orderIndex: 2 },
    ],
    starterCode: {
      python: `import sys\nn = int(sys.stdin.read().strip())\nprint(bin(n).count('1'))\n`,
      javascript: `const n = parseInt(require('fs').readFileSync('/dev/stdin','utf8').trim());\nconsole.log(n.toString(2).split('1').length - 1);\n`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        System.out.println(Integer.bitCount(n));\n    }\n}\n`,
    },
  },

  // ── MEDIUM ────────────────────────────────────────────────────────────────────
  {
    slug: 'minimum-bit-flips',
    title: 'Minimum Bit Flips to Convert Number',
    difficulty: 'Medium',
    category: 'Bit Manipulation',
    tier: 'mid',
    acceptanceRate: 81.3,
    description: 'Given two integers `start` and `goal`, return the minimum number of bit flips needed to convert `start` to `goal`. Line 1: `start`, Line 2: `goal`.',
    constraints: '- `0 <= start, goal <= 10^9`',
    examples: [{ input: '10\n7', output: '3', explanation: '10 (1010) and 7 (0111) differ by 3 bits', orderIndex: 0 }],
    testCases: [
      { input: '10\n7', expectedOutput: '3', isHidden: false, orderIndex: 0 },
      { input: '3\n4', expectedOutput: '3', isHidden: false, orderIndex: 1 },
    ],
    starterCode: {
      python: `import sys\nlines = sys.stdin.read().split('\\n')\nstart = int(lines[0]); goal = int(lines[1])\nprint(bin(start ^ goal).count('1'))\n`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').split('\\n');\nconst start = parseInt(lines[0]), goal = parseInt(lines[1]);\nconsole.log((start ^ goal).toString(2).split('1').length - 1);\n`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int start = sc.nextInt(), goal = sc.nextInt();\n        System.out.println(Integer.bitCount(start ^ goal));\n    }\n}\n`,
    },
  },
];
