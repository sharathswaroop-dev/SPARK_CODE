/**
 * Step 13: Heaps & Priority Queues — Easy / Medium / Hard
 * Tier: Easy → 'free' | Medium → 'mid' | Hard → 'pro'
 */
export const step13Problems = [
  // ── EASY ────────────────────────────────────────────────────────────────────
  {
    slug: 'kth-largest-element-heap',
    title: 'K-th Largest Element in an Array',
    difficulty: 'Easy',
    category: 'Heap',
    tier: 'free',
    acceptanceRate: 82.5,
    description: 'Given an integer array `nums` and an integer `k`, return the `k`-th largest element in the array. Line 1: nums, Line 2: `k`.',
    constraints: '- `1 <= k <= nums.length <= 10^4`\n- `-10^4 <= nums[i] <= 10^4`',
    examples: [{ input: '3 2 1 5 6 4\n2', output: '5', orderIndex: 0 }],
    testCases: [
      { input: '3 2 1 5 6 4\n2', expectedOutput: '5', isHidden: false, orderIndex: 0 },
      { input: '3 2 3 1 2 4 5 5 6\n4', expectedOutput: '4', isHidden: false, orderIndex: 1 },
    ],
    starterCode: {
      python: `import sys, heapq\nlines = sys.stdin.read().split('\\n')\nnums = list(map(int, lines[0].split()))\nk = int(lines[1])\nprint(heapq.nlargest(k, nums)[-1])\n`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').split('\\n');\nconst nums = lines[0].split(' ').map(Number);\nconst k = Number(lines[1]);\nnums.sort((a,b) => b-a);\nconsole.log(nums[k-1]);\n`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int[] nums = Arrays.stream(sc.nextLine().split(" ")).mapToInt(Integer::parseInt).toArray();\n        int k = sc.nextInt();\n        PriorityQueue<Integer> pq = new PriorityQueue<>();\n        for (int x : nums) {\n            pq.add(x);\n            if (pq.size() > k) pq.poll();\n        }\n        System.out.println(pq.peek());\n    }\n}\n`,
    },
  },

  // ── MEDIUM ────────────────────────────────────────────────────────────────────
  {
    slug: 'k-frequent-elements-heap',
    title: 'Top K Frequent Elements',
    difficulty: 'Medium',
    category: 'Heap',
    tier: 'mid',
    acceptanceRate: 74.6,
    description: 'Given an integer array `nums` and an integer `k`, return the `k` most frequent elements. Print space-separated in descending order of frequency. Line 1: nums, Line 2: `k`.',
    constraints: '- `1 <= nums.length <= 10^5`\n- `k` is in the range `[1, number of unique elements]`',
    examples: [{ input: '1 1 1 2 2 3\n2', output: '1 2', orderIndex: 0 }],
    testCases: [
      { input: '1 1 1 2 2 3\n2', expectedOutput: '1 2', isHidden: false, orderIndex: 0 },
      { input: '1\n1', expectedOutput: '1', isHidden: false, orderIndex: 1 },
    ],
    starterCode: {
      python: `import sys\nfrom collections import Counter\nlines = sys.stdin.read().split('\\n')\nnums = list(map(int, lines[0].split()))\nk = int(lines[1])\ncounts = Counter(nums)\nmost = [item[0] for item in counts.most_common(k)]\nprint(*most)\n`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').split('\\n');\nconst nums = lines[0].split(' ').map(Number);\nconst k = Number(lines[1]);\nconst counts = {};\nnums.forEach(n => counts[n] = (counts[n]||0) + 1);\nconst sorted = Object.keys(counts).sort((a,b) => counts[b] - counts[a]);\nconsole.log(sorted.slice(0, k).join(' '));\n`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int[] nums = Arrays.stream(sc.nextLine().split(" ")).mapToInt(Integer::parseInt).toArray();\n        int k = sc.nextInt();\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int x : nums) map.put(x, map.getOrDefault(x, 0) + 1);\n        List<Integer> list = new ArrayList<>(map.keySet());\n        list.sort((a,b) -> map.get(b) - map.get(a));\n        StringBuilder sb = new StringBuilder();\n        for(int i=0; i<k; i++) sb.append(list.get(i)).append(i<k-1?" ":"");\n        System.out.println(sb);\n    }\n}\n`,
    },
  },

  // ── HARD ─────────────────────────────────────────────────────────────────────
  {
    slug: 'find-median-data-stream',
    title: 'Find Median from Data Stream',
    difficulty: 'Hard',
    category: 'Heap',
    tier: 'pro',
    acceptanceRate: 53.7,
    description: 'Given a sequence of integers added one by one, print the median after each number is inserted (formatted to 1 decimal place). Space-separated output.',
    constraints: '- `1 <= number of elements <= 10^4`',
    examples: [{ input: '2 3 4', output: '2.0 2.5 3.0', orderIndex: 0 }],
    testCases: [
      { input: '2 3 4', expectedOutput: '2.0 2.5 3.0', isHidden: false, orderIndex: 0 },
      { input: '1 2', expectedOutput: '1.0 1.5', isHidden: false, orderIndex: 1 },
    ],
    starterCode: {
      python: `import sys, heapq\nnums = list(map(int, sys.stdin.read().split()))\nsmall, large = [], [] # max-heap, min-heap\nres = []\nfor x in nums:\n    heapq.heappush(small, -x)\n    if small and large and (-small[0] > large[0]):\n        heapq.heappush(large, -heapq.heappop(small))\n    if len(small) > len(large) + 1:\n        heapq.heappush(large, -heapq.heappop(small))\n    if len(large) > len(small):\n        heapq.heappush(small, -heapq.heappop(large))\n    if len(small) > len(large):\n        res.append(f"{-small[0]:.1f}")\n    else:\n        res.append(f"{(-small[0] + large[0]) / 2.0:.1f}")\nprint(*res)\n`,
      javascript: `const nums = require('fs').readFileSync('/dev/stdin','utf8').split(' ').map(Number);\nconst arr = [], res = [];\nnums.forEach(n => {\n  arr.push(n); arr.sort((a,b) => a-b);\n  const m = arr.length;\n  if (m % 2 === 1) res.push(arr[Math.floor(m/2)].toFixed(1));\n  else res.push(((arr[m/2-1] + arr[m/2])/2).toFixed(1));\n});\nconsole.log(res.join(' '));\n`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        PriorityQueue<Integer> small = new PriorityQueue<>(Collections.reverseOrder());\n        PriorityQueue<Integer> large = new PriorityQueue<>();\n        List<String> res = new ArrayList<>();\n        while(sc.hasNextInt()) {\n            int x = sc.nextInt();\n            small.add(x);\n            large.add(small.poll());\n            if(large.size() > small.size()) small.add(large.poll());\n            if(small.size() > large.size()) res.add(String.format(Locale.US, "%.1f", (double)small.peek()));\n            else res.add(String.format(Locale.US, "%.1f", (small.peek() + large.peek()) / 2.0));\n        }\n        System.out.println(String.join(" ", res));\n    }\n}\n`,
    },
  },
];
