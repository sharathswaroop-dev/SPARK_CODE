/**
 * Step 15: Tries & Advanced Data Structures — Easy / Medium / Hard
 * Tier: Easy → 'free' | Medium → 'mid' | Hard → 'pro'
 */
export const step15Problems = [
  // ── EASY ────────────────────────────────────────────────────────────────────
  {
    slug: 'prefix-count-trie',
    title: 'Count Words with Given Prefix',
    difficulty: 'Easy',
    category: 'Trie',
    tier: 'free',
    acceptanceRate: 88.0,
    description: 'Given an array of strings `words` and a string `pref`, return the number of strings in `words` that contain `pref` as a prefix. Line 1: words, Line 2: `pref`.',
    constraints: '- `1 <= words.length <= 100`\n- `1 <= words[i].length, pref.length <= 100`',
    examples: [{ input: 'pay attention attend yield attend\nat', output: '3', orderIndex: 0 }],
    testCases: [
      { input: 'pay attention attend yield attend\nat', expectedOutput: '3', isHidden: false, orderIndex: 0 },
      { input: 'leetcode win loops success\ncode', expectedOutput: '0', isHidden: false, orderIndex: 1 },
    ],
    starterCode: {
      python: `import sys\nlines = sys.stdin.read().split('\\n')\nwords = lines[0].split()\npref = lines[1].strip()\nprint(sum(1 for w in words if w.startswith(pref)))\n`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').split('\\n');\nconst words = lines[0].split(' ');\nconst pref = lines[1].trim();\nconsole.log(words.filter(w => w.startsWith(pref)).length);\n`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String[] words = sc.nextLine().split(" ");\n        String pref = sc.nextLine().trim();\n        int cnt = 0;\n        for(String w : words) if(w.startsWith(pref)) cnt++;\n        System.out.println(cnt);\n    }\n}\n`,
    },
  },

  // ── MEDIUM ────────────────────────────────────────────────────────────────────
  {
    slug: 'implement-trie-prefix-tree',
    title: 'Implement Trie (Prefix Tree)',
    difficulty: 'Medium',
    category: 'Trie',
    tier: 'mid',
    acceptanceRate: 72.0,
    description: 'A trie (prefix tree) is a tree data structure used to efficiently store strings. Process commands: `insert word`, `search word`, `startsWith prefix`. Print outputs for `search` (true/false) and `startsWith` (true/false) space-separated.',
    constraints: '- `1 <= number of calls <= 3000`',
    examples: [{ input: 'insert apple\nsearch apple\nsearch app\nstartsWith app\ninsert app\nsearch app', output: 'true false true true', orderIndex: 0 }],
    testCases: [
      { input: 'insert apple\nsearch apple\nsearch app\nstartsWith app\ninsert app\nsearch app', expectedOutput: 'true false true true', isHidden: false, orderIndex: 0 },
    ],
    starterCode: {
      python: `import sys\nclass TrieNode:\n    def __init__(self):\n        self.children = {}\n        self.is_end = False\nclass Trie:\n    def __init__(self):\n        self.root = TrieNode()\n    def insert(self, w):\n        curr = self.root\n        for c in w:\n            if c not in curr.children: curr.children[c] = TrieNode()\n            curr = curr.children[c]\n        curr.is_end = True\n    def search(self, w):\n        curr = self.root\n        for c in w:\n            if c not in curr.children: return False\n            curr = curr.children[c]\n        return curr.is_end\n    def startsWith(self, p):\n        curr = self.root\n        for c in p:\n            if c not in curr.children: return False\n            curr = curr.children[c]\n        return True\ntrie = Trie()\nres = []\nfor line in sys.stdin.read().strip().split('\\n'):\n    if not line.strip(): continue\n    parts = line.split()\n    cmd, val = parts[0], parts[1]\n    if cmd == 'insert': trie.insert(val)\n    elif cmd == 'search': res.append(str(trie.search(val)).lower())\n    elif cmd == 'startsWith': res.append(str(trie.startsWith(val)).lower())\nprint(*res)\n`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nclass Trie {\n  constructor() { this.root = {}; }\n  insert(w) {\n    let curr = this.root;\n    for(const c of w) { if(!curr[c]) curr[c] = {}; curr = curr[c]; }\n    curr.isEnd = true;\n  }\n  search(w) {\n    let curr = this.root;\n    for(const c of w) { if(!curr[c]) return false; curr = curr[c]; }\n    return !!curr.isEnd;\n  }\n  startsWith(p) {\n    let curr = this.root;\n    for(const c of p) { if(!curr[c]) return false; curr = curr[c]; }\n    return true;\n  }\n}\nconst trie = new Trie(), res = [];\nlines.forEach(l => {\n  if(!l.trim()) return;\n  const [cmd, val] = l.split(' ');\n  if(cmd === 'insert') trie.insert(val);\n  else if(cmd === 'search') res.push(trie.search(val));\n  else if(cmd === 'startsWith') res.push(trie.startsWith(val));\n});\nconsole.log(res.join(' '));\n`,
      java: `import java.util.*;\npublic class Main {\n    static class Node {\n        Map<Character, Node> children = new HashMap<>();\n        boolean isEnd = false;\n    }\n    static Node root = new Node();\n    static void insert(String w) {\n        Node curr = root;\n        for(char c : w.toCharArray()) curr = curr.children.computeIfAbsent(c, k -> new Node());\n        curr.isEnd = true;\n    }\n    static boolean search(String w) {\n        Node curr = root;\n        for(char c : w.toCharArray()) {\n            if(!curr.children.containsKey(c)) return false;\n            curr = curr.children.get(c);\n        }\n        return curr.isEnd;\n    }\n    static boolean startsWith(String p) {\n        Node curr = root;\n        for(char c : p.toCharArray()) {\n            if(!curr.children.containsKey(c)) return false;\n            curr = curr.children.get(c);\n        }\n        return true;\n    }\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        List<String> res = new ArrayList<>();\n        while(sc.hasNext()) {\n            String cmd = sc.next(), val = sc.next();\n            if(cmd.equals("insert")) insert(val);\n            else if(cmd.equals("search")) res.add(String.valueOf(search(val)));\n            else if(cmd.equals("startsWith")) res.add(String.valueOf(startsWith(val)));\n        }\n        System.out.println(String.join(" ", res));\n    }\n}\n`,
    },
  },

  // ── HARD ─────────────────────────────────────────────────────────────────────
  {
    slug: 'maximum-xor-two-numbers',
    title: 'Maximum XOR of Two Numbers in an Array',
    difficulty: 'Hard',
    category: 'Trie',
    tier: 'pro',
    acceptanceRate: 54.1,
    description: 'Given an integer array `nums`, return the maximum result of `nums[i] XOR nums[j]`, where `0 <= i <= j < n`.',
    constraints: '- `1 <= nums.length <= 2 * 10^4`\n- `0 <= nums[i] <= 2^31 - 1`',
    examples: [{ input: '3 10 5 25 2 8', output: '28', explanation: '5 XOR 25 = 28', orderIndex: 0 }],
    testCases: [
      { input: '3 10 5 25 2 8', expectedOutput: '28', isHidden: false, orderIndex: 0 },
      { input: '14 70 53 83 49 91 36 80 92 51', expectedOutput: '127', isHidden: false, orderIndex: 1 },
    ],
    starterCode: {
      python: `import sys\nnums = list(map(int, sys.stdin.read().split()))\nmax_xor, mask = 0, 0\nfor i in range(31, -1, -1):\n    mask |= (1 << i)\n    prefixes = {n & mask for n in nums}\n    temp = max_xor | (1 << i)\n    if any(temp ^ p in prefixes for p in prefixes):\n        max_xor = temp\nprint(max_xor)\n`,
      javascript: `const nums = require('fs').readFileSync('/dev/stdin','utf8').split(' ').map(Number);\nlet max = 0, mask = 0;\nfor(let i=31; i>=0; i--) {\n  mask |= (1 << i);\n  const set = new Set(nums.map(n => n & mask));\n  const tmp = max | (1 << i);\n  for(const p of set) {\n    if (set.has(tmp ^ p)) { max = tmp; break; }\n  }\n}\nconsole.log(max);\n`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int[] nums = Arrays.stream(sc.nextLine().split(" ")).mapToInt(Integer::parseInt).toArray();\n        int max = 0, mask = 0;\n        for(int i=31; i>=0; i--) {\n            mask |= (1 << i);\n            Set<Integer> set = new HashSet<>();\n            for(int n : nums) set.add(n & mask);\n            int tmp = max | (1 << i);\n            for(int p : set) {\n                if(set.contains(tmp ^ p)) { max = tmp; break; }\n            }\n        }\n        System.out.println(max);\n    }\n}\n`,
    },
  },
];
