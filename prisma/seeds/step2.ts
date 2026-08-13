/**
 * Step 2: Learn Important Sorting Techniques
 * Tier mapping: Easy → 'free', Medium → 'mid', Hard → 'pro'
 */
export const step2Problems = [
  {
    slug: 'selection-sort-algo',
    title: 'Selection Sort',
    difficulty: 'Easy',
    category: 'Sorting',
    tier: 'free',
    acceptanceRate: 77.0,
    description: 'Given an array of integers `nums`, sort the array in non-decreasing order using the Selection Sort algorithm.',
    constraints: '- `1 <= nums.length <= 1000`',
    examples: [{ input: 'nums = [64, 25, 12, 22, 11]', output: '11 12 22 25 64', orderIndex: 0 }],
    testCases: [
      { input: '64 25 12 22 11', expectedOutput: '11 12 22 25 64', isHidden: false, orderIndex: 0 },
    ],
    starterCode: {
      python: `import sys\nnums = list(map(int, sys.stdin.read().split()))\nfor i in range(len(nums)):\n    m_idx = i\n    for j in range(i+1, len(nums)):\n        if nums[j] < nums[m_idx]: m_idx = j\n    nums[i], nums[m_idx] = nums[m_idx], nums[i]\nprint(*nums)\n`,
      javascript: `const readline = require('readline');\nconst rl = readline.createInterface({ input: process.stdin });\nrl.on('line', l => {\n  const nums = l.split(' ').map(Number);\n  for (let i = 0; i < nums.length; i++) {\n    let minIdx = i;\n    for (let j = i + 1; j < nums.length; j++) if (nums[j] < nums[minIdx]) minIdx = j;\n    [nums[i], nums[minIdx]] = [nums[minIdx], nums[i]];\n  }\n  console.log(nums.join(' '));\n  rl.close();\n});\n`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int[] nums = Arrays.stream(sc.nextLine().split(" ")).mapToInt(Integer::parseInt).toArray();\n        for (int i = 0; i < nums.length; i++) {\n            int minIdx = i;\n            for (int j = i + 1; j < nums.length; j++) if (nums[j] < nums[minIdx]) minIdx = j;\n            int temp = nums[i]; nums[i] = nums[minIdx]; nums[minIdx] = temp;\n        }\n        for (int i = 0; i < nums.length; i++) System.out.print(nums[i] + (i == nums.length - 1 ? "" : " "));\n        System.out.println();\n    }\n}\n`,
    },
  },
  {
    slug: 'bubble-sort-algo',
    title: 'Bubble Sort',
    difficulty: 'Easy',
    category: 'Sorting',
    tier: 'free',
    acceptanceRate: 74.2,
    description: 'Sort an array of integers in non-decreasing order using the Bubble Sort algorithm.',
    constraints: '- `1 <= nums.length <= 1000`',
    examples: [{ input: '5 1 4 2 8', output: '1 2 4 5 8', orderIndex: 0 }],
    testCases: [
      { input: '5 1 4 2 8', expectedOutput: '1 2 4 5 8', isHidden: false, orderIndex: 0 },
    ],
    starterCode: {
      python: `import sys\nnums = list(map(int, sys.stdin.read().split()))\nn = len(nums)\nfor i in range(n):\n    for j in range(0, n-i-1):\n        if nums[j] > nums[j+1]: nums[j], nums[j+1] = nums[j+1], nums[j]\nprint(*nums)\n`,
      javascript: `const readline = require('readline');\nconst rl = readline.createInterface({ input: process.stdin });\nrl.on('line', l => {\n  const nums = l.split(' ').map(Number);\n  const n = nums.length;\n  for (let i = 0; i < n; i++) {\n    for (let j = 0; j < n - i - 1; j++) if (nums[j] > nums[j+1]) [nums[j], nums[j+1]] = [nums[j+1], nums[j]];\n  }\n  console.log(nums.join(' '));\n  rl.close();\n});\n`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int[] nums = Arrays.stream(sc.nextLine().split(" ")).mapToInt(Integer::parseInt).toArray();\n        int n = nums.length;\n        for (int i = 0; i < n; i++) {\n            for (int j = 0; j < n - i - 1; j++) if (nums[j] > nums[j+1]) { int t = nums[j]; nums[j] = nums[j+1]; nums[j+1] = t; }\n        }\n        for (int i = 0; i < n; i++) System.out.print(nums[i] + (i == n - 1 ? "" : " "));\n        System.out.println();\n    }\n}\n`,
    },
  },
  {
    slug: 'insertion-sort-algo',
    title: 'Insertion Sort',
    difficulty: 'Easy',
    category: 'Sorting',
    tier: 'free',
    acceptanceRate: 75.8,
    description: 'Sort an array of integers using Insertion Sort.',
    constraints: '- `1 <= nums.length <= 1000`',
    examples: [{ input: '12 11 13 5 6', output: '5 6 11 12 13', orderIndex: 0 }],
    testCases: [
      { input: '12 11 13 5 6', expectedOutput: '5 6 11 12 13', isHidden: false, orderIndex: 0 },
    ],
    starterCode: {
      python: `import sys\nnums = list(map(int, sys.stdin.read().split()))\nfor i in range(1, len(nums)):\n    key = nums[i]; j = i - 1\n    while j >= 0 and nums[j] > key: nums[j+1] = nums[j]; j -= 1\n    nums[j+1] = key\nprint(*nums)\n`,
      javascript: `const readline = require('readline');\nconst rl = readline.createInterface({ input: process.stdin });\nrl.on('line', l => {\n  const nums = l.split(' ').map(Number);\n  for (let i = 1; i < nums.length; i++) {\n    const key = nums[i]; let j = i - 1;\n    while (j >= 0 && nums[j] > key) { nums[j+1] = nums[j]; j--; }\n    nums[j+1] = key;\n  }\n  console.log(nums.join(' '));\n  rl.close();\n});\n`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int[] nums = Arrays.stream(sc.nextLine().split(" ")).mapToInt(Integer::parseInt).toArray();\n        for (int i = 1; i < nums.length; i++) {\n            int key = nums[i], j = i - 1;\n            while (j >= 0 && nums[j] > key) { nums[j+1] = nums[j]; j--; }\n            nums[j+1] = key;\n        }\n        for (int i = 0; i < nums.length; i++) System.out.print(nums[i] + (i == nums.length - 1 ? "" : " "));\n        System.out.println();\n    }\n}\n`,
    },
  },
  {
    slug: 'quick-sort-algo',
    title: 'Quick Sort Algorithm',
    difficulty: 'Medium',
    category: 'Sorting',
    tier: 'mid',
    acceptanceRate: 67.2,
    description: 'Sort an array of integers using Quick Sort (Lomuto partition scheme).',
    constraints: '- `1 <= nums.length <= 5 * 10^4`',
    examples: [{ input: '10 7 8 9 1 5', output: '1 5 7 8 9 10', orderIndex: 0 }],
    testCases: [
      { input: '10 7 8 9 1 5', expectedOutput: '1 5 7 8 9 10', isHidden: false, orderIndex: 0 },
    ],
    starterCode: {
      python: `import sys\nnums = list(map(int, sys.stdin.read().split()))\nprint(*(sorted(nums)))\n`,
      javascript: `const readline = require('readline');\nconst rl = readline.createInterface({ input: process.stdin });\nrl.on('line', l => { console.log(l.split(' ').map(Number).sort((a,b)=>a-b).join(' ')); rl.close(); });\n`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int[] nums = Arrays.stream(sc.nextLine().split(" ")).mapToInt(Integer::parseInt).sorted().toArray();\n        for (int i = 0; i < nums.length; i++) System.out.print(nums[i] + (i == nums.length - 1 ? "" : " "));\n        System.out.println();\n    }\n}\n`,
    },
  },
];
