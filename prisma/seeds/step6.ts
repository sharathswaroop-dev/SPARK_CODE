/**
 * Step 6: Linked List — Easy / Medium / Hard
 * Tier: Easy → 'free' | Medium → 'mid' | Hard → 'pro'
 */
export const step6Problems = [
  // ── EASY ────────────────────────────────────────────────────────────────────
  {
    slug: 'reverse-linked-list',
    title: 'Reverse a Linked List',
    difficulty: 'Easy',
    category: 'Linked List',
    tier: 'free',
    acceptanceRate: 85.2,
    description: 'Given the head of a singly linked list represented as an array of values, reverse the list and return the reversed elements as space-separated values.',
    constraints: '- `0 <= list length <= 5000`\n- `-5000 <= node.val <= 5000`',
    examples: [{ input: '1 2 3 4 5', output: '5 4 3 2 1', orderIndex: 0 }],
    testCases: [
      { input: '1 2 3 4 5', expectedOutput: '5 4 3 2 1', isHidden: false, orderIndex: 0 },
      { input: '1 2', expectedOutput: '2 1', isHidden: false, orderIndex: 1 },
      { input: '10', expectedOutput: '10', isHidden: true, orderIndex: 2 },
    ],
    starterCode: {
      python: `import sys\nvals = list(map(int, sys.stdin.read().split()))\nprint(*(vals[::-1]))\n`,
      javascript: `const rl = require('readline').createInterface({ input: process.stdin });\nrl.on('line', l => {\n  const a = l.split(' ').map(Number);\n  console.log(a.reverse().join(' '));\n  rl.close();\n});\n`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        List<Integer> a = new ArrayList<>();\n        while(sc.hasNextInt()) a.add(sc.nextInt());\n        Collections.reverse(a);\n        StringBuilder sb = new StringBuilder();\n        for(int i=0; i<a.size(); i++) sb.append(a.get(i)).append(i<a.size()-1?" ":"");\n        System.out.println(sb);\n    }\n}\n`,
    },
  },
  {
    slug: 'middle-of-linked-list',
    title: 'Find Middle Node of Linked List',
    difficulty: 'Easy',
    category: 'Linked List',
    tier: 'free',
    acceptanceRate: 83.1,
    description: 'Given a singly linked list, return the middle node value. If there are two middle nodes, return the second middle node value.',
    constraints: '- `1 <= node count <= 100`\n- `1 <= node.val <= 100`',
    examples: [{ input: '1 2 3 4 5', output: '3', orderIndex: 0 }],
    testCases: [
      { input: '1 2 3 4 5', expectedOutput: '3', isHidden: false, orderIndex: 0 },
      { input: '1 2 3 4 5 6', expectedOutput: '4', isHidden: false, orderIndex: 1 },
      { input: '7', expectedOutput: '7', isHidden: true, orderIndex: 2 },
    ],
    starterCode: {
      python: `import sys\nvals = list(map(int, sys.stdin.read().split()))\nprint(vals[len(vals)//2])\n`,
      javascript: `const rl = require('readline').createInterface({ input: process.stdin });\nrl.on('line', l => {\n  const a = l.split(' ').map(Number);\n  console.log(a[Math.floor(a.length / 2)]);\n  rl.close();\n});\n`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        List<Integer> a = new ArrayList<>();\n        while(sc.hasNextInt()) a.add(sc.nextInt());\n        System.out.println(a.get(a.size()/2));\n    }\n}\n`,
    },
  },
  {
    slug: 'merge-two-sorted-lists',
    title: 'Merge Two Sorted Linked Lists',
    difficulty: 'Easy',
    category: 'Linked List',
    tier: 'free',
    acceptanceRate: 81.0,
    description: 'Given two sorted linked lists as space-separated integers on separate lines, merge them into one sorted list and print the result.',
    constraints: '- `0 <= list length <= 50`\n- `-100 <= Node.val <= 100`',
    examples: [{ input: '1 2 4\n1 3 4', output: '1 1 2 3 4 4', orderIndex: 0 }],
    testCases: [
      { input: '1 2 4\n1 3 4', expectedOutput: '1 1 2 3 4 4', isHidden: false, orderIndex: 0 },
      { input: '1 5\n2 3 6', expectedOutput: '1 2 3 5 6', isHidden: false, orderIndex: 1 },
    ],
    starterCode: {
      python: `import sys\nlines = sys.stdin.read().split('\\n')\na = list(map(int, lines[0].split())) if lines[0].strip() else []\nb = list(map(int, lines[1].split())) if lines[1].strip() else []\nprint(*sorted(a + b))\n`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').split('\\n');\nconst a = lines[0].trim() ? lines[0].split(' ').map(Number) : [];\nconst b = lines[1].trim() ? lines[1].split(' ').map(Number) : [];\nconsole.log([...a, ...b].sort((x,y)=>x-y).join(' '));\n`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        List<Integer> l = new ArrayList<>();\n        while(sc.hasNextInt()) l.add(sc.nextInt());\n        Collections.sort(l);\n        StringBuilder sb = new StringBuilder();\n        for(int i=0; i<l.size(); i++) sb.append(l.get(i)).append(i<l.size()-1?" ":"");\n        System.out.println(sb);\n    }\n}\n`,
    },
  },

  // ── MEDIUM ────────────────────────────────────────────────────────────────────
  {
    slug: 'remove-nth-node-from-end',
    title: 'Remove N-th Node From End of List',
    difficulty: 'Medium',
    category: 'Linked List',
    tier: 'mid',
    acceptanceRate: 67.4,
    description: 'Given a linked list and integer `n`, remove the `n`-th node from the end of the list and return its head. Input: line 1 is list values, line 2 is `n`.',
    constraints: '- `1 <= list size <= 30`\n- `1 <= n <= list size`',
    examples: [{ input: '1 2 3 4 5\n2', output: '1 2 3 5', orderIndex: 0 }],
    testCases: [
      { input: '1 2 3 4 5\n2', expectedOutput: '1 2 3 5', isHidden: false, orderIndex: 0 },
      { input: '1\n1', expectedOutput: '', isHidden: false, orderIndex: 1 },
      { input: '1 2\n1', expectedOutput: '1', isHidden: true, orderIndex: 2 },
    ],
    starterCode: {
      python: `import sys\nlines = sys.stdin.read().split('\\n')\nnums = list(map(int, lines[0].split()))\nn = int(lines[1])\nidx = len(nums) - n\nnums.pop(idx)\nprint(*nums)\n`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').split('\\n');\nconst nums = lines[0].split(' ').map(Number);\nconst n = Number(lines[1]);\nnums.splice(nums.length - n, 1);\nconsole.log(nums.join(' '));\n`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int[] nums = Arrays.stream(sc.nextLine().split(" ")).mapToInt(Integer::parseInt).toArray();\n        int n = sc.nextInt();\n        List<Integer> list = new ArrayList<>();\n        for(int x : nums) list.add(x);\n        list.remove(list.size() - n);\n        StringBuilder sb = new StringBuilder();\n        for(int i=0; i<list.size(); i++) sb.append(list.get(i)).append(i<list.size()-1?" ":"");\n        System.out.println(sb);\n    }\n}\n`,
    },
  },
  {
    slug: 'add-two-numbers-ll',
    title: 'Add Two Numbers as Linked Lists',
    difficulty: 'Medium',
    category: 'Linked List',
    tier: 'mid',
    acceptanceRate: 64.9,
    description: 'Given two non-empty linked lists representing two non-negative integers stored in reverse order, add the two numbers and return the sum as a reversed linked list.',
    constraints: '- `1 <= list size <= 100`\n- `0 <= Node.val <= 9`',
    examples: [{ input: '2 4 3\n5 6 4', output: '7 0 8', explanation: '342 + 465 = 807 -> 7 -> 0 -> 8', orderIndex: 0 }],
    testCases: [
      { input: '2 4 3\n5 6 4', expectedOutput: '7 0 8', isHidden: false, orderIndex: 0 },
      { input: '0\n0', expectedOutput: '0', isHidden: false, orderIndex: 1 },
      { input: '9 9 9\n1', expectedOutput: '0 0 0 1', isHidden: true, orderIndex: 2 },
    ],
    starterCode: {
      python: `import sys\nlines = sys.stdin.read().split('\\n')\na = list(map(int, lines[0].split()))\nb = list(map(int, lines[1].split()))\ncarry, res = 0, []\ni = j = 0\nwhile i < len(a) or j < len(b) or carry:\n    v1 = a[i] if i < len(a) else 0\n    v2 = b[j] if j < len(b) else 0\n    val = v1 + v2 + carry\n    carry = val // 10\n    res.append(val % 10)\n    i += 1; j += 1\nprint(*res)\n`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').split('\\n');\nconst a = lines[0].split(' ').map(Number);\nconst b = lines[1].split(' ').map(Number);\nlet c = 0, res = [], i = 0, j = 0;\nwhile(i < a.length || j < b.length || c) {\n  const v1 = i < a.length ? a[i] : 0;\n  const v2 = j < b.length ? b[j] : 0;\n  const s = v1 + v2 + c;\n  c = Math.floor(s / 10);\n  res.push(s % 10);\n  i++; j++;\n}\nconsole.log(res.join(' '));\n`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int[] a = Arrays.stream(sc.nextLine().split(" ")).mapToInt(Integer::parseInt).toArray();\n        int[] b = Arrays.stream(sc.nextLine().split(" ")).mapToInt(Integer::parseInt).toArray();\n        List<Integer> res = new ArrayList<>();\n        int c = 0, i = 0, j = 0;\n        while(i < a.length || j < b.length || c > 0) {\n            int v1 = i < a.length ? a[i] : 0;\n            int v2 = j < b.length ? b[j] : 0;\n            int s = v1 + v2 + c;\n            c = s / 10;\n            res.add(s % 10);\n            i++; j++;\n        }\n        StringBuilder sb = new StringBuilder();\n        for(int k=0; k<res.size(); k++) sb.append(res.get(k)).append(k<res.size()-1?" ":"");\n        System.out.println(sb);\n    }\n}\n`,
    },
  },

  // ── HARD ─────────────────────────────────────────────────────────────────────
  {
    slug: 'reverse-nodes-in-k-group',
    title: 'Reverse Nodes in k-Group',
    difficulty: 'Hard',
    category: 'Linked List',
    tier: 'pro',
    acceptanceRate: 56.8,
    description: 'Given a linked list and integer `k`, reverse the nodes of the list `k` at a time. If the number of nodes is not a multiple of `k`, left-out nodes at the end remain as they are. Input: line 1 is list, line 2 is `k`.',
    constraints: '- `1 <= k <= list size <= 5000`',
    examples: [{ input: '1 2 3 4 5\n2', output: '2 1 4 3 5', orderIndex: 0 }],
    testCases: [
      { input: '1 2 3 4 5\n2', expectedOutput: '2 1 4 3 5', isHidden: false, orderIndex: 0 },
      { input: '1 2 3 4 5\n3', expectedOutput: '3 2 1 4 5', isHidden: false, orderIndex: 1 },
    ],
    starterCode: {
      python: `import sys\nlines = sys.stdin.read().split('\\n')\nnums = list(map(int, lines[0].split()))\nk = int(lines[1])\nres = []\nfor i in range(0, len(nums), k):\n    group = nums[i:i+k]\n    if len(group) == k: res.extend(reversed(group))\n    else: res.extend(group)\nprint(*res)\n`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').split('\\n');\nconst nums = lines[0].split(' ').map(Number);\nconst k = Number(lines[1]);\nconst res = [];\nfor(let i=0; i<nums.length; i+=k) {\n  const g = nums.slice(i, i+k);\n  if(g.length === k) res.push(...g.reverse());\n  else res.push(...g);\n}\nconsole.log(res.join(' '));\n`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int[] nums = Arrays.stream(sc.nextLine().split(" ")).mapToInt(Integer::parseInt).toArray();\n        int k = sc.nextInt();\n        List<Integer> res = new ArrayList<>();\n        for(int i=0; i<nums.length; i+=k) {\n            if(i+k <= nums.length) {\n                for(int j=i+k-1; j>=i; j--) res.add(nums[j]);\n            } else {\n                for(int j=i; j<nums.length; j++) res.add(nums[j]);\n            }\n        }\n        StringBuilder sb = new StringBuilder();\n        for(int i=0; i<res.size(); i++) sb.append(res.get(i)).append(i<res.size()-1?" ":"");\n        System.out.println(sb);\n    }\n}\n`,
    },
  },
];
