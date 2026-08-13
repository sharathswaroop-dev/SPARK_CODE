import { readFileSync } from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const COMPANIES = ['Amazon', 'Google', 'Microsoft', 'Meta', 'Apple', 'Adobe', 'Uber', 'Netflix', 'Flipkart'];

interface RawProblem {
  id: number;
  title: string;
  step: number;
  topic: string;
  difficulty?: string;
  status?: string;
  platform?: string;
  problem_url?: string;
  tags?: string;
  notes?: string;
}

function cleanCategory(topic: string, step: number): string {
  const t = topic.toLowerCase();
  if (t.includes('array')) return 'Array';
  if (t.includes('string')) return 'String';
  if (t.includes('binary search')) return 'Binary Search';
  if (t.includes('linked list') || t.includes('ll')) return 'Linked List';
  if (t.includes('recursion') || t.includes('backtracking')) return 'Recursion';
  if (t.includes('bit')) return 'Bit Manipulation';
  if (t.includes('stack') || t.includes('queue')) return 'Stack & Queue';
  if (t.includes('sliding window') || t.includes('two pointer')) return 'Sliding Window';
  if (t.includes('heap') || t.includes('priority queue')) return 'Heap';
  if (t.includes('greedy')) return 'Greedy';
  if (t.includes('bst') || t.includes('binary search tree')) return 'BST';
  if (t.includes('tree')) return 'Tree';
  if (t.includes('graph')) return 'Graph';
  if (t.includes('dp') || t.includes('dynamic programming')) return 'Dynamic Programming';
  if (t.includes('trie')) return 'Trie';
  if (t.includes('sort')) return 'Sorting';
  
  // Step based fallback
  const stepMap: Record<number, string> = {
    1: 'Basics', 2: 'Sorting', 3: 'Array', 4: 'Binary Search', 5: 'String',
    6: 'Linked List', 7: 'Recursion', 8: 'Bit Manipulation', 9: 'Stack & Queue',
    10: 'Sliding Window', 11: 'Heap', 12: 'Greedy', 13: 'Tree', 14: 'BST',
    15: 'Graph', 16: 'Dynamic Programming', 17: 'Trie', 18: 'Advanced Math'
  };
  return stepMap[step] || 'Algorithms';
}

function determineDifficulty(rawDiff: string | undefined, title: string, id: number): 'Easy' | 'Medium' | 'Hard' {
  if (rawDiff && ['Easy', 'Medium', 'Hard'].includes(rawDiff)) {
    return rawDiff as 'Easy' | 'Medium' | 'Hard';
  }
  const t = title.toLowerCase();
  if (t.includes('hard') || t.includes('median') || t.includes('n-queens') || t.includes('lru') || t.includes('lfu') || t.includes('word ladder') || t.includes('sudoku') || t.includes('trapping') || t.includes('edit distance') || t.includes('burst') || t.includes('reg')) {
    return 'Hard';
  }
  if (t.includes('medium') || t.includes('sum') || t.includes('search') || t.includes('rotate') || t.includes('subsets') || t.includes('combination') || t.includes('tree') || t.includes('graph') || t.includes('dp') || id % 3 === 0) {
    return 'Medium';
  }
  return 'Easy';
}

async function main() {
  const jsonPath = 'C:/Users/sharath swaroop .M/Desktop/sparkcode/src/data/striver_455.json';
  const fileData = readFileSync(jsonPath, 'utf-8');
  const json = JSON.parse(fileData);

  const problems: RawProblem[] = json.problems;
  console.log(`Loaded ${problems.length} problems from striver_455.json dataset.`);

  let seeded = 0;

  for (let i = 0; i < problems.length; i++) {
    const p = problems[i];
    const difficulty = determineDifficulty(p.difficulty, p.title, p.id);
    const category = cleanCategory(p.topic, p.step);
    const tier = difficulty === 'Easy' ? 'free' : difficulty === 'Medium' ? 'mid' : 'pro';

    let slug = p.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    if (!slug) slug = `striver-problem-${p.id}`;

    // Companies assignment
    const c1 = COMPANIES[i % COMPANIES.length];
    const c2 = COMPANIES[(i + 4) % COMPANIES.length];
    const companyTagsList = [c1, c2];

    const starterPython = `# Python solution for: ${p.title}\nimport sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data: return\n    print(" ".join(data))\n\nif __name__ == '__main__':\n    main()\n`;
    const starterJS = `// JavaScript solution for: ${p.title}\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);\nif (input.length && input[0]) console.log(input.join(' '));\n`;
    const starterJava = `// Java solution for: ${p.title}\nimport java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNext()) System.out.println(sc.next());\n    }\n}\n`;

    await prisma.problem.upsert({
      where: { slug },
      update: {
        title: p.title,
        difficulty,
        category,
        tier,
        description: `### ${p.title}\n\n**Topic**: ${p.topic}\n**Step**: Step ${p.step}\n\nSolve the problem meeting standard time and memory limits. Read input from standard input and print the result.`,
        constraints: `- \`1 <= N <= 10^5\`\n- Time Limit: 1.0s\n- Memory Limit: 256MB`,
        companyTags: JSON.stringify(companyTagsList),
        acceptanceRate: Math.round((55.0 + ((p.id * 7) % 35) + Math.random() * 3) * 10) / 10,
      },
      create: {
        slug,
        title: p.title,
        difficulty,
        category,
        tier,
        description: `### ${p.title}\n\n**Topic**: ${p.topic}\n**Step**: Step ${p.step}\n\nSolve the problem meeting standard time and memory limits. Read input from standard input and print the result.`,
        constraints: `- \`1 <= N <= 10^5\`\n- Time Limit: 1.0s\n- Memory Limit: 256MB`,
        companyTags: JSON.stringify(companyTagsList),
        acceptanceRate: Math.round((55.0 + ((p.id * 7) % 35) + Math.random() * 3) * 10) / 10,
        examples: {
          create: [
            { input: '1 2 3 4 5', output: '1 2 3 4 5', explanation: 'Sample execution output.', orderIndex: 0 }
          ]
        },
        testCases: {
          create: [
            { input: '1 2 3 4 5', expectedOutput: '1 2 3 4 5', isHidden: false, orderIndex: 0 },
            { input: '10 20 30', expectedOutput: '10 20 30', isHidden: true, orderIndex: 1 }
          ]
        },
        starterCode: {
          create: [
            { language: 'python', code: starterPython },
            { language: 'javascript', code: starterJS },
            { language: 'java', code: starterJava }
          ]
        }
      }
    });

    seeded++;
    if (seeded % 50 === 0 || seeded === problems.length) {
      console.log(`Progress: ${seeded}/${problems.length} problems seeded...`);
    }
  }

  const count = await prisma.problem.count();
  console.log(`\n🎉 SUCCESS! Database now contains ${count} total problems!`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
