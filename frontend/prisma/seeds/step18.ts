/**
 * Step 18: Advanced Strings & Math Challenges — Easy / Medium / Hard
 * Tier: Easy → 'free' | Medium → 'mid' | Hard → 'pro'
 */
export const step18Problems = [
  // ── EASY ────────────────────────────────────────────────────────────────────
  {
    slug: 'valid-anagram-check',
    title: 'Valid Anagram',
    difficulty: 'Easy',
    category: 'String',
    tier: 'free',
    acceptanceRate: 88.9,
    description: 'Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise. Line 1: `s`, Line 2: `t`.',
    constraints: '- `1 <= s.length, t.length <= 5 * 10^4`\n- Lowercase English letters only',
    examples: [{ input: 'anagram\nnagaram', output: 'true', orderIndex: 0 }],
    testCases: [
      { input: 'anagram\nnagaram', expectedOutput: 'true', isHidden: false, orderIndex: 0 },
      { input: 'rat\ncar', expectedOutput: 'false', isHidden: false, orderIndex: 1 },
    ],
    starterCode: {
      python: `import sys\nlines = sys.stdin.read().split('\\n')\ns, t = lines[0].strip(), lines[1].strip()\nprint(str(sorted(s) == sorted(t)).lower())\n`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').split('\\n');\nconst s = lines[0].trim(), t = lines[1].trim();\nconsole.log(s.split('').sort().join('') === t.split('').sort().join(''));\n`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        char[] s = sc.nextLine().trim().toCharArray();\n        char[] t = sc.nextLine().trim().toCharArray();\n        Arrays.sort(s); Arrays.sort(t);\n        System.out.println(Arrays.equals(s, t));\n    }\n}\n`,
    },
  },

  // ── MEDIUM ────────────────────────────────────────────────────────────────────
  {
    slug: 'string-to-integer-atoi',
    title: 'String to Integer (atoi)',
    difficulty: 'Medium',
    category: 'String',
    tier: 'mid',
    acceptanceRate: 61.2,
    description: 'Implement the `myAtoi(string s)` function, which converts a string to a 32-bit signed integer (similar to C/C++\'s `atoi` function). Clamp to `[-2^31, 2^31 - 1]`.',
    constraints: '- `0 <= s.length <= 200`',
    examples: [{ input: '   -42', output: '-42', orderIndex: 0 }],
    testCases: [
      { input: '   -42', expectedOutput: '-42', isHidden: false, orderIndex: 0 },
      { input: '4193 with words', expectedOutput: '4193', isHidden: false, orderIndex: 1 },
      { input: 'words and 987', expectedOutput: '0', isHidden: true, orderIndex: 2 },
    ],
    starterCode: {
      python: `import sys\ns = sys.stdin.read().strip()\ni = 0; n = len(s); sign = 1; val = 0\nwhile i < n and s[i] == ' ': i += 1\nif i < n and s[i] in ('-', '+'):\n    if s[i] == '-': sign = -1\n    i += 1\nwhile i < n and s[i].isdigit():\n    val = val * 10 + int(s[i]); i += 1\nval *= sign\nINT_MIN, INT_MAX = -2**31, 2**31 - 1\nprint(max(INT_MIN, min(INT_MAX, val)))\n`,
      javascript: `const s = require('fs').readFileSync('/dev/stdin','utf8').trim();\nlet i = 0, n = s.length, sign = 1, val = 0;\nwhile(i < n && s[i] === ' ') i++;\nif(i < n && (s[i] === '-' || s[i] === '+')) {\n  if(s[i] === '-') sign = -1;\n  i++;\n}\nwhile(i < n && s[i] >= '0' && s[i] <= '9') {\n  val = val * 10 + Number(s[i]); i++;\n}\nval *= sign;\nconst MIN = -2147483648, MAX = 2147483647;\nconsole.log(Math.max(MIN, Math.min(MAX, val)));\n`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        String s = new Scanner(System.in).nextLine();\n        int i = 0, n = s.length(), sign = 1;\n        long val = 0;\n        while(i < n && s.charAt(i) == ' ') i++;\n        if(i < n && (s.charAt(i) == '-' || s.charAt(i) == '+')) {\n            if(s.charAt(i) == '-') sign = -1;\n            i++;\n        }\n        while(i < n && Character.isDigit(s.charAt(i))) {\n            val = val * 10 + (s.charAt(i) - '0');\n            if(val * sign > Integer.MAX_VALUE) { System.out.println(Integer.MAX_VALUE); return; }\n            if(val * sign < Integer.MIN_VALUE) { System.out.println(Integer.MIN_VALUE); return; }\n            i++;\n        }\n        System.out.println((int)(val * sign));\n    }\n}\n`,
    },
  },

  // ── HARD ─────────────────────────────────────────────────────────────────────
  {
    slug: 'regular-expression-matching',
    title: 'Regular Expression Matching',
    difficulty: 'Hard',
    category: 'String',
    tier: 'pro',
    acceptanceRate: 46.8,
    description: 'Given an input string `s` and a pattern `p`, implement regular expression matching with support for \'.\' (matches any single char) and \'*\' (matches zero or more of preceding element). Line 1: `s`, Line 2: `p`.',
    constraints: '- `1 <= s.length, p.length <= 20`',
    examples: [{ input: 'aa\na*', output: 'true', orderIndex: 0 }],
    testCases: [
      { input: 'aa\na*', expectedOutput: 'true', isHidden: false, orderIndex: 0 },
      { input: 'ab\n.*', expectedOutput: 'true', isHidden: false, orderIndex: 1 },
      { input: 'mississippi\nmis*is*p*.', expectedOutput: 'false', isHidden: true, orderIndex: 2 },
    ],
    starterCode: {
      python: `import sys\nlines = sys.stdin.read().split('\\n')\ns, p = lines[0].strip(), lines[1].strip()\nmemo = {}\ndef is_match(i, j):\n    if (i, j) in memo: return memo[(i, j)]\n    if j == len(p): return i == len(s)\n    first = i < len(s) and (p[j] == s[i] or p[j] == '.')\n    if j + 1 < len(p) and p[j+1] == '*':\n        ans = is_match(i, j+2) or (first and is_match(i+1, j))\n    else:\n        ans = first and is_match(i+1, j+1)\n    memo[(i, j)] = ans\n    return ans\nprint(str(is_match(0, 0)).lower())\n`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').split('\\n');\nconst s = lines[0].trim(), p = lines[1].trim();\nconst memo = new Map();\nfunction isMatch(i, j) {\n  const k = \`\${i},\${j}\`;\n  if (memo.has(k)) return memo.get(k);\n  if (j === p.length) return i === s.length;\n  const first = i < s.length && (p[j] === s[i] || p[j] === '.');\n  let ans;\n  if (j + 1 < p.length && p[j+1] === '*') {\n    ans = isMatch(i, j+2) || (first && isMatch(i+1, j));\n  } else {\n    ans = first && isMatch(i+1, j+1);\n  }\n  memo.set(k, ans);\n  return ans;\n}\nconsole.log(isMatch(0, 0));\n`,
      java: `import java.util.*;\npublic class Main {\n    static String s, p; static Boolean[][] memo;\n    static boolean isMatch(int i, int j) {\n        if (j == p.length()) return i == s.length();\n        if (memo[i][j] != null) return memo[i][j];\n        boolean first = i < s.length() && (p.charAt(j) == s.charAt(i) || p.charAt(j) == '.');\n        boolean ans;\n        if (j + 1 < p.length() && p.charAt(j+1) == '*') {\n            ans = isMatch(i, j+2) || (first && isMatch(i+1, j));\n        } else {\n            ans = first && isMatch(i+1, j+1);\n        }\n        return memo[i][j] = ans;\n    }\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        s = sc.nextLine().trim(); p = sc.nextLine().trim();\n        memo = new Boolean[s.length()+1][p.length()+1];\n        System.out.println(isMatch(0, 0));\n    }\n}\n`,
    },
  },
];
