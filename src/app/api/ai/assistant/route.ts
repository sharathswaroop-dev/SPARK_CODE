/**
 * POST /api/ai/assistant
 * AI-Powered Mentorship Engine for DSA problem solving:
 * 1. Progressive Socratic Hints (Tiers 1, 2, 3)
 * 2. Big-O Complexity & Code Optimization Analyzer
 * 3. AI Bug & Error Explainer
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';

const assistantRequestSchema = z.object({
  action: z.enum(['hint', 'analyze_complexity', 'explain_error']),
  problemId: z.string().min(1),
  language: z.string().default('python'),
  code: z.string().optional(),
  hintTier: z.number().min(1).max(3).optional(),
  errorDetails: z.object({
    verdict: z.string().optional(),
    stdout: z.string().optional(),
    stderr: z.string().optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Rate limit: max 20 AI assistant requests per minute per user
    const rl = rateLimit(`ai:${session.user.id}`, { windowSeconds: 60, maxRequests: 20 });
    if (!rl.success) {
      return NextResponse.json(
        { error: `AI request limit exceeded. Please wait ${rl.resetSeconds}s before requesting assistance again.` },
        { status: 429 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const parsed = assistantRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 });
    }

    const { action, problemId, language, code = '', hintTier = 1, errorDetails } = parsed.data;

    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      include: {
        examples: { orderBy: { orderIndex: 'asc' }, take: 2 },
      },
    });

    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }

    // ─── 1. Socratic Progressive Hints Generator ───────────────────────────
    if (action === 'hint') {
      const hints = generateSocraticHints(problem, hintTier);
      return NextResponse.json({
        success: true,
        action: 'hint',
        tier: hintTier,
        title: hints.title,
        content: hints.content,
        takeaway: hints.takeaway,
      });
    }

    // ─── 2. Big-O Complexity & Code Optimization Analyzer ───────────────────
    if (action === 'analyze_complexity') {
      const analysis = analyzeCodeComplexity(code, language, problem);
      return NextResponse.json({
        success: true,
        action: 'analyze_complexity',
        timeComplexity: analysis.timeComplexity,
        spaceComplexity: analysis.spaceComplexity,
        verdict: analysis.verdict,
        bottlenecks: analysis.bottlenecks,
        suggestions: analysis.suggestions,
        optimizations: analysis.optimizations,
      });
    }

    // ─── 3. AI Bug & Error Explainer ────────────────────────────────────────
    if (action === 'explain_error') {
      const explanation = explainErrorVerdict(errorDetails, problem, code);
      return NextResponse.json({
        success: true,
        action: 'explain_error',
        summary: explanation.summary,
        rootCause: explanation.rootCause,
        fixStrategy: explanation.fixStrategy,
        checklist: explanation.checklist,
      });
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'AI Assistant Error' }, { status: 500 });
  }
}

// ─── Socratic Hints Logic ──────────────────────────────────────────────────
function generateSocraticHints(problem: any, tier: number) {
  const cat = problem.category.toLowerCase();
  const title = problem.title;
  const diff = problem.difficulty;

  if (tier === 1) {
    // Tier 1: Intuition & Pattern Recognition
    let pattern = 'Hash Map / Frequency Counter';
    let intuition = `Look closely at the problem constraints. Can we process items in a single pass while retaining state in constant time?`;

    if (cat.includes('array') || cat.includes('two pointer')) {
      pattern = 'Two Pointers or Sliding Window';
      intuition = `Notice if the elements can be sorted or partitioned. If sorted, two pointers (one at left, one at right) can eliminate redundant iterations.`;
    } else if (cat.includes('tree') || cat.includes('bst')) {
      pattern = 'Recursive Depth-First Search (DFS) / Tree Traversal';
      intuition = `Break the tree down into its subproblems: if you know the answer for the left subtree and the right subtree, how do you combine them at the current root?`;
    } else if (cat.includes('dp') || cat.includes('dynamic')) {
      pattern = 'State Memoization / Subproblem Overlap';
      intuition = `Identify the state tuple: What variable choices define each decision step? Does computing a subproblem twice waste exponential time?`;
    } else if (cat.includes('graph')) {
      pattern = 'Breadth-First Search (BFS) / Topological Sort';
      intuition = `Model the relationships as vertices and edges. If searching for the shortest unweighted path, standard level-by-level BFS is optimal.`;
    } else if (cat.includes('binary search')) {
      pattern = 'Binary Search on Monotonic Space';
      intuition = `Is there a monotonic condition $P(x)$ that is FALSE for small values and TRUE for all values $\\ge K$? If so, search the predicate boundary.`;
    }

    return {
      title: `Tier 1: Intuition & Pattern (${pattern})`,
      content: intuition,
      takeaway: `Formulate the core invariant before writing code. Identify what information you must carry at each step.`,
    };
  }

  if (tier === 2) {
    // Tier 2: Algorithmic Step-by-Step Blueprint
    return {
      title: `Tier 2: Algorithmic Blueprint`,
      content: `1. Initialize the required auxiliary data structures (e.g. hash map, pointers, or recursion stack).\n2. Iterate through the input sequence while maintaining the target invariant.\n3. At each step, verify whether the current candidate satisfies the problem objective.\n4. Update pointers/state and return the aggregated result.`,
      takeaway: `Aim for $O(N)$ or $O(N \\log N)$ time complexity. Avoid nested $O(N^2)$ brute force loops if constraints exceed $10^4$.`,
    };
  }

  // Tier 3: Edge-Case Watchlist & Guard Rails
  return {
    title: `Tier 3: Critical Edge-Case Watchlist`,
    content: `• Empty / Single-Element Input: Ensure your loop doesn't index out of bounds when length is 0 or 1.\n• Duplicate Elements: Does your logic handle duplicate keys or values correctly?\n• Boundary & Negative Numbers: Account for negative values and integer overflow risks.\n• Extremes: Maximize or minimize the input constraints to verify memory and time limits.`,
    takeaway: `Always test with at least 2 manual edge cases before hitting submit!`,
  };
}

// ─── Code Complexity Analyzer ──────────────────────────────────────────────
function analyzeCodeComplexity(code: string, language: string, problem: any) {
  const lower = code.toLowerCase();

  // Heuristic analysis of loop nesting and recursion
  let loopCount = 0;
  if (language === 'python') {
    const forMatches = code.match(/\bfor\b/g) || [];
    const whileMatches = code.match(/\bwhile\b/g) || [];
    loopCount = forMatches.length + whileMatches.length;
  } else {
    const forMatches = code.match(/\bfor\s*\(/g) || [];
    const whileMatches = code.match(/\bwhile\s*\(/g) || [];
    loopCount = forMatches.length + whileMatches.length;
  }

  const hasNestedLoops = (code.match(/for[\s\S]*?for/g) || []).length > 0;
  const hasRecursion = code.includes('def ') && (code.match(/return\s+\w+\(/g) || []).length > 0;
  const usesSorting = lower.includes('.sort') || lower.includes('sorted(') || lower.includes('arrays.sort');
  const usesHashMap = lower.includes('map') || lower.includes('dict') || lower.includes('set(') || lower.includes('unordered_map') || lower.includes('{');

  let timeComplexity = 'O(N)';
  let spaceComplexity = 'O(1)';
  let verdict = 'Optimal Algorithmic Structure';

  if (hasNestedLoops) {
    timeComplexity = 'O(N²)';
    spaceComplexity = usesHashMap ? 'O(N)' : 'O(1)';
    verdict = 'Sub-optimal: Quadratic Time Complexity detected.';
  } else if (usesSorting) {
    timeComplexity = 'O(N log N)';
    spaceComplexity = 'O(log N) to O(N)';
    verdict = 'Good: Efficient Sorting-Based Approach.';
  } else if (hasRecursion) {
    timeComplexity = 'O(N)';
    spaceComplexity = 'O(N) [Recursion Stack]';
    verdict = 'Recursive Traversal Approach.';
  } else if (usesHashMap) {
    timeComplexity = 'O(N)';
    spaceComplexity = 'O(N)';
    verdict = 'Optimal: Linear Time with Auxiliary Hash Map.';
  }

  return {
    timeComplexity,
    spaceComplexity,
    verdict,
    bottlenecks: [
      hasNestedLoops ? 'Nested loops detected which may trigger Time Limit Exceeded (TLE) on large inputs.' : 'No severe quadratic bottlenecks found.',
      usesHashMap ? 'Auxiliary memory usage for Hash Map / Set state.' : 'Constant auxiliary space utilized.',
    ],
    suggestions: [
      'Maintain memory bounds within standard 256MB execution limit.',
      'Prefer in-place two-pointer modifications when extra space is prohibited.',
    ],
    optimizations: [
      'Use fast I/O practices for Java and C++ submissions.',
      'Pre-allocate collections if the total capacity is known ahead of time.',
    ],
  };
}

// ─── AI Bug & Error Explainer ──────────────────────────────────────────────
function explainErrorVerdict(errorDetails: any, problem: any, code: string) {
  const verdict = errorDetails?.verdict || 'RUNTIME_ERROR';
  const stderr = errorDetails?.stderr || '';
  const stdout = errorDetails?.stdout || '';

  if (verdict === 'WRONG_ANSWER') {
    return {
      summary: 'Output Discrepancy (Wrong Answer)',
      rootCause: `Your algorithm produced a result that did not match the expected canonical answer for one or more hidden test cases.`,
      fixStrategy: `Check whether your loop indices include all necessary elements, and verify if edge conditions (like single elements, zeroes, or duplicate keys) are handled gracefully.`,
      checklist: [
        'Did you return 0-indexed vs 1-indexed values as required by the problem statement?',
        'Are boundary conditions inclusive or exclusive?',
        'Does your code handle negative numbers or empty input lists?',
      ],
    };
  }

  if (verdict === 'TIME_LIMIT_EXCEEDED') {
    return {
      summary: 'Time Limit Exceeded (TLE > 2000ms)',
      rootCause: `Your code exceeded the allowed execution time limit. This commonly occurs with nested $O(N^2)$ loops or infinite while-loops where termination variables fail to increment.`,
      fixStrategy: `Upgrade the algorithm from $O(N^2)$ to $O(N)$ or $O(N \\log N)$ using a Hash Map, Two Pointers, or Binary Search.`,
      checklist: [
        'Ensure all while loop pointers increment/decrement towards termination.',
        'Avoid redundant linear scans inside loops; replace with Hash Set lookups.',
        'Avoid heavy string concatenation inside iterations.',
      ],
    };
  }

  return {
    summary: 'Runtime or Compilation Exception',
    rootCause: stderr || `An unhandled exception occurred during execution (e.g. IndexError, NullPointerException, or ZeroDivisionError).`,
    fixStrategy: `Inspect the stack trace for line-level errors. Ensure all array lookups are guarded against out-of-bounds indices.`,
    checklist: [
      'Check if accessing array[i] when i >= length.',
      'Ensure variables are properly initialized before usage.',
      'Verify scanner/stdin reading reaches EOF without throwing.',
    ],
  };
}
