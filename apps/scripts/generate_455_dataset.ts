import { writeFileSync } from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const COMPANIES = ['Amazon', 'Google', 'Microsoft', 'Meta', 'Apple', 'Adobe', 'Uber', 'Netflix', 'Flipkart'];

interface ProblemSpec {
  slug: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  step: number;
}

// ─── Complete 455 Problem Catalog Breakdown (Steps 1–18) ────────────────────

function build455Catalog(): ProblemSpec[] {
  const catalog: ProblemSpec[] = [];

  // Helper to add problems
  const add = (step: number, category: string, title: string, diff: 'Easy' | 'Medium' | 'Hard') => {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    catalog.push({ slug, title, difficulty: diff, category, step });
  };

  // Step 1: Basics (31)
  const step1Titles = [
    'User Input and Output', 'Data Type Sizes', 'If Else Decision Making', 'Switch Case Statement',
    'Array and String Basics', 'For Loops Practice', 'While Loops Counting', 'Pass by Value and Reference',
    'Time and Space Complexity Analysis', 'Right Half Pyramid Pattern', 'Inverted Pyramid Pattern',
    'Diamond Star Pattern', 'Half Diamond Star Pattern', 'Binary Number Triangle Pattern',
    'Number Crown Pattern', 'Increasing Number Triangle', 'Increasing Letter Triangle',
    'Alpha Hill Pattern', 'Alpha Diamond Pattern', 'Hollow Rectangle Pattern',
    'Count Digits in Integer', 'Reverse an Integer', 'Check Palindrome Number', 'Find GCD or HCF',
    'Check Armstrong Number', 'Print All Divisors', 'Check for Prime Number', 'Factorial of N Numbers',
    'Fibonacci Number Recursive', 'Sum of First N Numbers', 'Reverse Array Recursive'
  ];
  step1Titles.forEach(t => add(1, 'Basics', t, 'Easy'));

  // Step 2: Sorting (7)
  const step2 = [
    ['Selection Sort Algorithm', 'Easy'], ['Bubble Sort Algorithm', 'Easy'], ['Insertion Sort Algorithm', 'Easy'],
    ['Merge Sort Algorithm', 'Medium'], ['Quick Sort Algorithm', 'Medium'], ['Recursive Bubble Sort', 'Easy'],
    ['Recursive Insertion Sort', 'Easy']
  ] as const;
  step2.forEach(([t, d]) => add(2, 'Sorting', t, d as any));

  // Step 3: Arrays (40)
  const step3 = [
    ['Largest Element in Array', 'Easy'], ['Second Largest Element in Array', 'Easy'], ['Check if Array is Sorted', 'Easy'],
    ['Remove Duplicates from Sorted Array', 'Easy'], ['Left Rotate Array by One', 'Easy'], ['Left Rotate Array by K Places', 'Easy'],
    ['Move Zeroes to End', 'Easy'], ['Linear Search in Array', 'Easy'], ['Union of Two Sorted Arrays', 'Easy'],
    ['Find Missing Number in Array', 'Easy'], ['Maximum Consecutive Ones', 'Easy'], ['Find Element Appearing Once', 'Easy'],
    ['Longest Subarray with Sum K Positive', 'Easy'], ['Longest Subarray with Sum K Positives Negatives', 'Easy'],
    ['Two Sum Problem', 'Medium'], ['Sort Array of 0s 1s 2s', 'Medium'], ['Majority Element Moore Voting', 'Medium'],
    ['Maximum Subarray Sum Kadane', 'Medium'], ['Print Maximum Subarray Sum', 'Medium'], ['Best Time to Buy and Sell Stock', 'Medium'],
    ['Rearrange Array Elements by Sign', 'Medium'], ['Next Permutation', 'Medium'], ['Leaders in an Array', 'Medium'],
    ['Longest Consecutive Sequence in Array', 'Medium'], ['Set Matrix Zeroes', 'Medium'], ['Rotate Matrix Image by 90 Degrees', 'Medium'],
    ['Spiral Traversal of Matrix', 'Medium'], ['Count Subarrays with Given Sum', 'Medium'],
    ['Pascal Triangle Generator', 'Hard'], ['Majority Element II N By 3', 'Hard'], ['Three Sum Problem', 'Hard'],
    ['Four Sum Problem', 'Hard'], ['Longest Subarray with Zero Sum', 'Hard'], ['Count Subarrays with Given XOR K', 'Hard'],
    ['Merge Overlapping Subintervals', 'Hard'], ['Merge Two Sorted Arrays Without Extra Space', 'Hard'],
    ['Find Missing and Repeating Number', 'Hard'], ['Count Inversions in Array', 'Hard'], ['Reverse Pairs Count', 'Hard'],
    ['Maximum Product Subarray', 'Hard']
  ] as const;
  step3.forEach(([t, d]) => add(3, 'Array', t, d as any));

  // Step 4: Binary Search (32)
  const step4 = [
    ['Binary Search Classic', 'Easy'], ['Lower Bound in Sorted Array', 'Easy'], ['Upper Bound in Sorted Array', 'Easy'],
    ['Search Insert Position', 'Easy'], ['Floor and Ceil in Sorted Array', 'Easy'], ['First and Last Occurrence of Element', 'Easy'],
    ['Count Occurrences in Sorted Array', 'Easy'], ['Search in Rotated Sorted Array I', 'Medium'], ['Search in Rotated Sorted Array II', 'Medium'],
    ['Find Minimum in Rotated Sorted Array', 'Medium'], ['Find Kth Rotation Count in Array', 'Medium'], ['Single Element in Sorted Array', 'Medium'],
    ['Find Peak Element', 'Medium'], ['Square Root of Integer Binary Search', 'Easy'], ['Nth Root of Integer Binary Search', 'Easy'],
    ['Koko Eating Bananas', 'Medium'], ['Minimum Days to Make M Bouquets', 'Medium'], ['Find Smallest Divisor Given Threshold', 'Medium'],
    ['Capacity to Ship Packages Within D Days', 'Medium'], ['Kth Missing Positive Number', 'Medium'], ['Aggressive Cows Distance', 'Medium'],
    ['Book Allocation Problem', 'Hard'], ['Split Array Largest Sum', 'Hard'], ['Painter Partition Problem', 'Hard'],
    ['Minimize Max Distance to Gas Station', 'Hard'], ['Median of Two Sorted Arrays', 'Hard'], ['Kth Element of Two Sorted Arrays', 'Hard'],
    ['Search in 2D Matrix', 'Medium'], ['Search in 2D Matrix II Row Column Sorted', 'Medium'], ['Find Peak Element in 2D Matrix Grid', 'Hard'],
    ['Matrix Median Row Sorted', 'Hard'], ['Row with Maximum Number of 1s', 'Easy']
  ] as const;
  step4.forEach(([t, d]) => add(4, 'Binary Search', t, d as any));

  // Step 5: Strings (15)
  const step5 = [
    ['Remove Outermost Parentheses', 'Easy'], ['Reverse Words in a String', 'Easy'], ['Largest Odd Number in String', 'Easy'],
    ['Longest Common Prefix', 'Easy'], ['Isomorphic Strings Check', 'Easy'], ['Check if String is Rotation', 'Easy'],
    ['Check for Anagram Strings', 'Easy'], ['Sort Characters by Frequency', 'Medium'], ['Maximum Nesting Depth of Parentheses', 'Easy'],
    ['Roman to Integer Conversion', 'Easy'], ['Integer to Roman Conversion', 'Medium'], ['String to Integer Atoi Implementation', 'Medium'],
    ['Count Number of Substrings with K Distinct', 'Medium'], ['Longest Palindromic Substring', 'Hard'], ['Sum of Beauty of All Substrings', 'Medium']
  ] as const;
  step5.forEach(([t, d]) => add(5, 'String', t, d as any));

  // Step 6: Linked List (31)
  const step6 = [
    ['Introduction to Singly Linked List', 'Easy'], ['Insert Node in Singly Linked List', 'Easy'], ['Delete Node in Singly Linked List', 'Easy'],
    ['Find Length of Singly Linked List', 'Easy'], ['Search Element in Singly Linked List', 'Easy'], ['Introduction to Doubly Linked List', 'Easy'],
    ['Insert Node in Doubly Linked List', 'Easy'], ['Delete Node in Doubly Linked List', 'Easy'], ['Reverse Doubly Linked List', 'Easy'],
    ['Middle of Singly Linked List', 'Easy'], ['Reverse Singly Linked List Iterative Recursive', 'Easy'], ['Detect Cycle Loop in Linked List', 'Easy'],
    ['Find Starting Node of Cycle in Linked List', 'Medium'], ['Find Length of Loop in Linked List', 'Easy'], ['Check if Linked List is Palindrome', 'Medium'],
    ['Segregate Odd and Even Nodes in Linked List', 'Medium'], ['Remove Nth Node from End of Linked List', 'Medium'], ['Delete Middle Node of Linked List', 'Medium'],
    ['Sort Linked List using Merge Sort', 'Medium'], ['Sort List of 0s 1s 2s Linked List', 'Easy'], ['Find Intersection Point of Y Linked Lists', 'Medium'],
    ['Add One to Number Represented by Linked List', 'Medium'], ['Add Two Numbers Represented by Linked Lists', 'Medium'], ['Delete All Occurrences of Key in DLL', 'Medium'],
    ['Find Pairs with Given Sum in Doubly Linked List', 'Medium'], ['Remove Duplicates from Sorted Doubly Linked List', 'Easy'], ['Reverse Nodes in K Group Linked List', 'Hard'],
    ['Rotate Linked List Right by K Places', 'Medium'], ['Flatten Multilevel Doubly Linked List', 'Hard'], ['Clone Linked List with Random Pointer', 'Hard'],
    ['Design Browser History using Doubly Linked List', 'Medium']
  ] as const;
  step6.forEach(([t, d]) => add(6, 'Linked List', t, d as any));

  // Step 7: Recursion & Backtracking (26)
  const step7 = [
    ['Recursive Implementation of Pow X N', 'Easy'], ['Count Good Numbers Recursive', 'Medium'], ['Reverse Stack Using Recursion', 'Medium'],
    ['Sort Stack Using Recursion', 'Medium'], ['Generate Binary Strings Without Consecutive Ones', 'Medium'], ['Generate All Balanced Parentheses Combinations', 'Medium'],
    ['Generate All Subsets Power Set', 'Medium'], ['Subsets II Duplicates Allowed', 'Medium'], ['Combination Sum I', 'Medium'],
    ['Combination Sum II Unique Combinations', 'Medium'], ['Combination Sum III', 'Medium'], ['Subset Sum I Sum of All Subsets', 'Easy'],
    ['Subset Sum II Unique Subsets', 'Medium'], ['Letter Combinations of a Phone Number', 'Medium'], ['Partition String into Palindromic Substrings', 'Medium'],
    ['Word Search Grid Backtracking', 'Medium'], ['N Queens Problem Solution', 'Hard'], ['Sudoku Solver Backtracking', 'Hard'],
    ['M Coloring Problem Graph Backtracking', 'Hard'], ['Rat in a Maze Path Search', 'Hard'], ['Word Break II All Sentence Combinations', 'Hard'],
    ['Expression Add Operators Backtracking', 'Hard'], ['Kth Permutation Sequence', 'Hard'], ['Palindromic Partitioning II Minimum Cuts', 'Hard'],
    ['Matchsticks to Square Backtracking', 'Medium'], ['Construct Unique Binary Trees Count', 'Medium']
  ] as const;
  step7.forEach(([t, d]) => add(7, 'Recursion', t, d as any));

  // Step 8: Bit Manipulation (18)
  const step8 = [
    ['Check if Kth Bit is Set or Not', 'Easy'], ['Check if Number is Odd or Even Bitwise', 'Easy'], ['Check if Number is Power of Two', 'Easy'],
    ['Count Number of Set Bits Hamming Weight', 'Easy'], ['Set Unset Clear Kth Bit', 'Easy'], ['Toggle Kth Bit', 'Easy'],
    ['Unset Rightmost Set Bit', 'Easy'], ['Count Bits to Flip to Convert A to B', 'Medium'], ['Find Single Number in Array', 'Easy'],
    ['Find Single Number II Element Thrice', 'Medium'], ['Find Single Number III Two Unique Elements', 'Medium'], ['XOR of Numbers in Range L to R', 'Medium'],
    ['Find Two Numbers with Odd Occurrences', 'Medium'], ['Generate All Subsets Using Bitmasking', 'Medium'], ['Divide Two Integers Without Multiplication', 'Medium'],
    ['Bitwise AND of Numbers Range', 'Medium'], ['Maximum XOR of Two Numbers in Array', 'Hard'], ['Maximum XOR With an Element From Array', 'Hard']
  ] as const;
  step8.forEach(([t, d]) => add(8, 'Bit Manipulation', t, d as any));

  // Step 9: Stack and Queues (30)
  const step9 = [
    ['Implement Stack Using Arrays', 'Easy'], ['Implement Queue Using Arrays', 'Easy'], ['Implement Stack Using Queues', 'Easy'],
    ['Implement Queue Using Stacks', 'Easy'], ['Implement Stack Using Linked List', 'Easy'], ['Implement Queue Using Linked List', 'Easy'],
    ['Check Valid Parentheses Balance', 'Easy'], ['Min Stack O1 Extra Space', 'Medium'], ['Infix to Postfix Conversion', 'Medium'],
    ['Infix to Prefix Conversion', 'Medium'], ['Postfix to Infix Conversion', 'Medium'], ['Prefix to Infix Conversion', 'Medium'],
    ['Postfix to Prefix Conversion', 'Medium'], ['Prefix to Postfix Conversion', 'Medium'], ['Next Greater Element I', 'Medium'],
    ['Next Greater Element II Circular', 'Medium'], ['Next Smaller Element', 'Medium'], ['Number of NGEs to Right', 'Medium'],
    ['Trapping Rain Water Stack', 'Hard'], ['Asteroid Collision Stack', 'Medium'], ['Sum of Subarray Minimums', 'Hard'],
    ['Stock Span Problem Monotonic Stack', 'Medium'], ['Sliding Window Maximum Monotonic Queue', 'Hard'], ['Largest Rectangle in Histogram', 'Hard'],
    ['Maximal Rectangle in Binary Matrix', 'Hard'], ['Remove K Digits Smallest Number', 'Medium'], ['Sum of Subarray Ranges', 'Hard'],
    ['LRU Cache Implementation', 'Hard'], ['LFU Cache Implementation', 'Hard'], ['Celebrity Problem Elimination Stack', 'Medium']
  ] as const;
  step9.forEach(([t, d]) => add(9, 'Stack & Queue', t, d as any));

  // Step 10: Sliding Window & Two Pointers (12)
  const step10 = [
    ['Maximum Points You Can Obtain from Cards', 'Medium'], ['Longest Substring Without Repeating Characters', 'Medium'], ['Max Consecutive Ones III K Flips', 'Medium'],
    ['Fruit Into Baskets Two Types', 'Medium'], ['Longest Substring with At Most K Distinct Characters', 'Medium'], ['Number of Substrings Containing All Three Characters', 'Medium'],
    ['Longest Repeating Character Replacement', 'Medium'], ['Binary Subarrays With Sum Target', 'Medium'], ['Count Number of Nice Subarrays', 'Medium'],
    ['Subarrays with K Different Integers', 'Hard'], ['Minimum Window Substring Shortest Window', 'Hard'], ['Minimum Window Subsequence', 'Hard']
  ] as const;
  step10.forEach(([t, d]) => add(10, 'Sliding Window', t, d as any));

  // Step 11: Heaps (12)
  const step11 = [
    ['Introduction to Priority Queue Min Max Heap', 'Easy'], ['Convert Min Heap to Max Heap', 'Easy'], ['Check if Array Represents Min Heap', 'Easy'],
    ['Kth Largest Element in Array Heap', 'Medium'], ['Kth Smallest Element in Array Heap', 'Medium'], ['Sort K Sorted Array Nearly Sorted', 'Medium'],
    ['K Frequent Elements Frequency Heap', 'Medium'], ['Top K Frequent Words Lexicographical', 'Medium'], ['Connect N Ropes with Minimum Cost', 'Medium'],
    ['Task Scheduler CPU Cooling Intervals', 'Medium'], ['Hands of Straights Consecutive Groups', 'Medium'], ['Find Median from Continuous Data Stream', 'Hard']
  ] as const;
  step11.forEach(([t, d]) => add(11, 'Heap', t, d as any));

  // Step 12: Greedy Algorithms (15)
  const step12 = [
    ['Assign Cookies to Children Greedy', 'Easy'], ['Fractional Knapsack Problem Value Density', 'Medium'], ['Find Minimum Number of Coins Fractional Greedy', 'Easy'],
    ['Lemonade Change Counter', 'Easy'], ['Valid Parentheses String Star Wildcard', 'Medium'], ['Jump Game Reachability Check', 'Medium'],
    ['Jump Game II Minimum Jumps Required', 'Medium'], ['Minimum Platforms Required for Trains', 'Medium'], ['Job Sequencing Problem Max Profit', 'Hard'],
    ['N Meetings in One Room Non Overlapping', 'Medium'], ['Non Overlapping Intervals Removal', 'Medium'], ['Insert Interval and Merge', 'Medium'],
    ['Merge Overlapping Intervals Greedy', 'Medium'], ['Candy Distribution Minimum Total', 'Hard'], ['Page Faults in LRU Cache', 'Medium']
  ] as const;
  step12.forEach(([t, d]) => add(12, 'Greedy', t, d as any));

  // Step 13: Binary Trees (38)
  const step13 = [
    ['Introduction to Binary Trees Structure', 'Easy'], ['Binary Tree Preorder Traversal Iterative Recursive', 'Easy'], ['Binary Tree Inorder Traversal Iterative Recursive', 'Easy'],
    ['Binary Tree Postorder Traversal Iterative Recursive', 'Easy'], ['Level Order Traversal BFS Binary Tree', 'Easy'], ['Height or Maximum Depth of Binary Tree', 'Easy'],
    ['Check for Balanced Binary Tree Depth', 'Easy'], ['Diameter of Binary Tree Longest Path', 'Easy'], ['Maximum Path Sum in Binary Tree', 'Hard'],
    ['Check if Two Binary Trees are Identical', 'Easy'], ['Zigzag Level Order Traversal Binary Tree', 'Medium'], ['Boundary Traversal of Binary Tree', 'Medium'],
    ['Vertical Order Traversal of Binary Tree', 'Hard'], ['Top View of Binary Tree', 'Medium'], ['Bottom View of Binary Tree', 'Medium'],
    ['Right and Left Side View of Binary Tree', 'Easy'], ['Check for Symmetric Mirror Binary Tree', 'Easy'], ['Root to Leaf Paths in Binary Tree', 'Easy'],
    ['Lowest Common Ancestor LCA in Binary Tree', 'Medium'], ['Maximum Width of Binary Tree', 'Medium'], ['Children Sum Property in Binary Tree', 'Medium'],
    ['Nodes at Distance K in Binary Tree', 'Hard'], ['Min Time to Burn Entire Binary Tree', 'Hard'], ['Count Total Nodes in Complete Binary Tree', 'Medium'],
    ['Unique Binary Tree Requirements', 'Easy'], ['Construct Binary Tree from Preorder and Inorder', 'Medium'], ['Construct Binary Tree from Postorder and Inorder', 'Medium'],
    ['Serialize and Deserialize Binary Tree', 'Hard'], ['Morris Inorder Traversal O1 Space', 'Medium'], ['Flatten Binary Tree to Linked List Inplace', 'Medium'],
    ['Invert or Flip Binary Tree', 'Easy'], ['Check Subtree of Another Tree', 'Easy'], ['Path Sum K Root to Leaf', 'Easy'],
    ['Path Sum II All Root to Leaf Paths', 'Medium'], ['Path Sum III Any Node to Node Path', 'Hard'], ['Populating Next Right Pointers in Each Node', 'Medium'],
    ['Sum Root to Leaf Numbers', 'Medium'], ['House Robber III Binary Tree DP', 'Hard']
  ] as const;
  step13.forEach(([t, d]) => add(13, 'Tree', t, d as any));

  // Step 14: Binary Search Trees (14)
  const step14 = [
    ['Search in Binary Search Tree', 'Easy'], ['Find Min Max Value in BST', 'Easy'], ['Insert Node in Binary Search Tree', 'Easy'],
    ['Delete Node in Binary Search Tree', 'Medium'], ['Find Kth Smallest Element in BST', 'Medium'], ['Find Kth Largest Element in BST', 'Medium'],
    ['Check if Binary Tree is Valid BST', 'Medium'], ['Lowest Common Ancestor LCA in BST', 'Medium'], ['Construct BST from Preorder Traversal', 'Medium'],
    ['Inorder Successor Predecessor in BST', 'Medium'], ['BST Iterator Next HasNext O1 Space', 'Medium'], ['Two Sum IV Input is a BST', 'Easy'],
    ['Recover BST Swapped Two Nodes', 'Hard'], ['Largest BST Subtree in Binary Tree', 'Hard']
  ] as const;
  step14.forEach(([t, d]) => add(14, 'BST', t, d as any));

  // Step 15: Graphs (54)
  const step15 = [
    ['Graph Representation Adjacency Matrix List', 'Easy'], ['BFS Traversal of Undirected Graph', 'Easy'], ['DFS Traversal of Undirected Graph', 'Easy'],
    ['Number of Connected Components in Graph', 'Medium'], ['Rotting Oranges Grid BFS Time', 'Medium'], ['Flood Fill Algorithm Color Change', 'Easy'],
    ['01 Matrix Distance to Nearest 0', 'Medium'], ['Surrounded Regions Replace O with X', 'Medium'], ['Number of Enclaves Boundary Unreachable', 'Medium'],
    ['Word Ladder I Shortest Length', 'Hard'], ['Word Ladder II All Shortest Transformation Paths', 'Hard'], ['Number of Distinct Islands Shape Hash', 'Medium'],
    ['Bipartite Graph Check BFS DFS', 'Medium'], ['Detect Cycle in Undirected Graph BFS', 'Medium'], ['Detect Cycle in Undirected Graph DFS', 'Medium'],
    ['Detect Cycle in Directed Graph DFS', 'Medium'], ['Topological Sort Kahn Algorithm Indegree BFS', 'Medium'], ['Topological Sort DFS Stack', 'Medium'],
    ['Course Schedule I Cycle Check', 'Medium'], ['Course Schedule II Order of Courses', 'Medium'], ['Find Eventual Safe States Directed Graph', 'Medium'],
    ['Alien Dictionary Order of Characters', 'Hard'], ['Shortest Path in Unweighted Undirected Graph', 'Easy'], ['Shortest Path in DAG Topological Sort Weighted', 'Medium'],
    ['Dijkstra Shortest Path Priority Queue', 'Medium'], ['Shortest Path in Binary Matrix Grid BFS', 'Medium'], ['Path With Minimum Effort Grid Priority Queue', 'Medium'],
    ['Cheapest Flights Within K Stops Bellman Ford', 'Medium'], ['Network Delay Time All Nodes Dijkstra', 'Medium'], ['Number of Ways to Arrive at Destination', 'Hard'],
    ['Minimum Multiplications to Reach End', 'Medium'], ['Bellman Ford Shortest Path Algorithm', 'Medium'], ['Floyd Warshall All Pairs Shortest Path', 'Medium'],
    ['Find City With Smallest Number of Neighbors', 'Medium'], ['Prim Algorithm Minimum Spanning Tree MST', 'Medium'], ['Kruskal Algorithm Minimum Spanning Tree DSU', 'Medium'],
    ['Disjoint Set Union DSU Rank Path Compression', 'Medium'], ['Number of Operations to Make Network Connected', 'Medium'], ['Most Stones Removed with Same Row Column', 'Medium'],
    ['Accounts Merge User Emails DSU', 'Medium'], ['Number of Islands II Dynamic Add DSU', 'Hard'], ['Making a Large Island Change 0 to 1', 'Hard'],
    ['Swim in Rising Water Grid Dijkstra', 'Hard'], ['Strongly Connected Components Kosaraju Algorithm', 'Hard'], ['Bridges in Graph Tarjan Algorithm', 'Hard'],
    ['Articulation Points in Graph', 'Hard'], ['Tarjan Offline LCA Lowest Common Ancestor Graph', 'Hard'], ['Eulerian Path and Circuit Check', 'Hard'],
    ['Reconstruct Itinerary Hierholzer Algorithm', 'Hard'], ['Graph Valid Tree Connectivity Check', 'Medium'], ['Clone Graph Deep Copy', 'Medium'],
    ['Minimum Height Trees Center Nodes', 'Medium'], ['Evaluate Division Directed Graph Weights', 'Medium'], ['Is Graph Bipartite Colored Two Sets', 'Medium']
  ] as const;
  step15.forEach(([t, d]) => add(15, 'Graph', t, d as any));

  // Step 16: Dynamic Programming (56)
  const step16 = [
    ['Introduction to Dynamic Programming Memoization Tabulation', 'Easy'], ['Climbing Stairs Distinct Ways', 'Easy'], ['Frog Jump Minimum Energy', 'Easy'],
    ['Frog Jump with K Distance', 'Medium'], ['Maximum Sum of Non Adjacent Elements Robber', 'Easy'], ['House Robber II Circular Houses', 'Medium'],
    ['Ninja Training 2D Activity Selection DP', 'Medium'], ['Grid Unique Paths I Count', 'Medium'], ['Grid Unique Paths II Obstacles', 'Medium'],
    ['Minimum Path Sum Grid Top Left to Bottom Right', 'Medium'], ['Triangle Minimum Path Sum Top to Bottom', 'Medium'], ['Minimum Falling Path Sum Matrix', 'Medium'],
    ['Cherry Pickup II 3D Grid DP', 'Hard'], ['Subset Sum Equal to Target DP', 'Medium'], ['Partition Equal Subset Sum', 'Medium'],
    ['Array Partition with Minimum Absolute Sum Difference', 'Hard'], ['Count Subsets with Sum K', 'Medium'], ['Count Partitions with Given Difference', 'Medium'],
    ['Knapsack Problem 01 Value Maximize', 'Medium'], ['Minimum Coins Change Problem', 'Medium'], ['Target Sum Assignment Plus Minus', 'Medium'],
    ['Coin Change II Total Ways', 'Medium'], ['Unbounded Knapsack Unlimited Items', 'Medium'], ['Rod Cutting Problem Max Profit', 'Medium'],
    ['Longest Common Subsequence LCS Length', 'Medium'], ['Print Longest Common Subsequence', 'Medium'], ['Longest Common Substring Consecutive', 'Medium'],
    ['Longest Palindromic Subsequence LPS', 'Medium'], ['Minimum Insertions to Make String Palindrome', 'Medium'], ['Minimum Deletions Insertions to Convert String A to B', 'Medium'],
    ['Shortest Common Supersequence Length Print', 'Hard'], ['Distinct Subsequences Count S in T', 'Hard'], ['Edit Distance Levenshtein Matrix', 'Hard'],
    ['Wildcard Matching Pattern Question Star', 'Hard'], ['Best Time to Buy and Sell Stock I Single Transaction', 'Easy'], ['Best Time to Buy and Sell Stock II Unlimited Transactions', 'Medium'],
    ['Best Time to Buy and Sell Stock III At Most Two Transactions', 'Hard'], ['Best Time to Buy and Sell Stock IV At Most K Transactions', 'Hard'], ['Best Time to Buy and Sell Stock with Cooldown Day', 'Medium'],
    ['Best Time to Buy and Sell Stock with Transaction Fee', 'Medium'], ['Longest Increasing Subsequence LIS Length', 'Medium'], ['Print Longest Increasing Subsequence Path', 'Medium'],
    ['Longest Increasing Subsequence Binary Search NlogN', 'Medium'], ['Largest Divisible Subset Modulo Condition', 'Medium'], ['Longest String Chain Predecessor', 'Medium'],
    ['Longest Bitonic Subsequence Increasing then Decreasing', 'Hard'], ['Number of Longest Increasing Subsequences Count', 'Medium'], ['Matrix Chain Multiplication MCM Minimum Cost', 'Hard'],
    ['Minimum Cost to Cut a Stick MCM', 'Hard'], ['Burst Balloons MCM DP Max Coins', 'Hard'], ['Evaluate Boolean Expression to True MCM', 'Hard'],
    ['Palindrome Partitioning II Minimum Cut DP', 'Hard'], ['Partition Array for Maximum Sum Partitioning', 'Medium'], ['Maximum Rectangle Area Binary Matrix 2D Histograms', 'Hard'],
    ['Count Square Submatrices with All Ones', 'Medium'], ['Decode Ways Message Encoding Count', 'Medium']
  ] as const;
  step16.forEach(([t, d]) => add(16, 'Dynamic Programming', t, d as any));

  // Step 17: Tries (7)
  const step17 = [
    ['Implement Trie I Insert Search StartsWith', 'Medium'], ['Implement Trie II Count Words Count Prefix Erase', 'Medium'], ['Longest Word With All Prefixes Complete', 'Medium'],
    ['Number of Distinct Substrings in String Trie', 'Medium'], ['Bitwise Maximum XOR of Two Numbers in Array', 'Hard'], ['Maximum XOR With an Element From Array Queries', 'Hard'],
    ['Design In Memory File System Trie', 'Hard']
  ] as const;
  step17.forEach(([t, d]) => add(17, 'Trie', t, d as any));

  // Step 18: Advanced Strings & Math Challenges (17)
  const step18 = [
    ['Count Prime Numbers Sieve of Eratosthenes', 'Easy'], ['Find Prime Factors of Number', 'Easy'], ['Print All Prime Factors of a Number', 'Easy'],
    ['Power Exponentiation Binary Exponentiation', 'Easy'], ['Modular Exponentiation Binary Power', 'Medium'], ['Count Digits Modulo Division Math', 'Easy'],
    ['Check Armstrong Number Math', 'Easy'], ['Print All Divisors Square Root Method', 'Easy'], ['Euler Totient Function Phi Count', 'Medium'],
    ['Segmented Sieve Prime Range', 'Hard'], ['Find NCR Combinations Pascal Row', 'Medium'], ['Find Kth Permutation Sequence LeetCode', 'Hard'],
    ['Valid Anagram String Frequency Check', 'Easy'], ['Group Anagrams Sorted Key Hash Map', 'Medium'], ['Valid Palindrome II At Most One Deletion', 'Easy'],
    ['Longest Substring Without Repeating Characters Sliding Window', 'Medium'], ['Regular Expression Matching Full String Pattern', 'Hard']
  ] as const;
  step18.forEach(([t, d]) => add(18, 'Advanced Math & Strings', t, d as any));

  return catalog;
}

// ─── Main Generator Script ───────────────────────────────────────────────────

async function main() {
  const specs = build455Catalog();
  console.log(`Generated specifications for ${specs.length} DSA problems across 18 steps.`);

  let seededCount = 0;

  for (let i = 0; i < specs.length; i++) {
    const s = specs[i];
    const problemIdNum = i + 1; // 1 to 455

    // Assign 2-3 company tags per problem
    const c1 = COMPANIES[i % COMPANIES.length];
    const c2 = COMPANIES[(i + 3) % COMPANIES.length];
    const companyTagsList = [c1, c2];

    const tier = s.difficulty === 'Easy' ? 'free' : s.difficulty === 'Medium' ? 'mid' : 'pro';

    const starterPython = `# Python 3.10 solution for ${s.title}\nimport sys\n\ndef solve():\n    inputs = sys.stdin.read().split()\n    if not inputs: return\n    # Implement solution here\n    print(" ".join(inputs))\n\nif __name__ == '__main__':\n    solve()\n`;

    const starterJS = `// JavaScript solution for ${s.title}\nconst fs = require('fs');\nfunction solve() {\n  const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);\n  if (!input.length || !input[0]) return;\n  console.log(input.join(' '));\n}\nsolve();\n`;

    const starterJava = `// Java 15 solution for ${s.title}\nimport java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNext()) {\n            System.out.println(sc.next());\n        }\n    }\n}\n`;

    await prisma.problem.upsert({
      where: { slug: s.slug },
      update: {
        title: s.title,
        difficulty: s.difficulty,
        category: s.category,
        tier: tier,
        description: `Given problem **${s.title}** under step ${s.step} (${s.category}). Implement an optimal solution meeting time and space constraints.`,
        constraints: `- \`1 <= input.length <= 10^5\`\n- Optimal time complexity requirement: O(N) or O(N log N)`,
        companyTags: JSON.stringify(companyTagsList),
        acceptanceRate: Math.round((50 + (i % 40) + Math.random() * 5) * 10) / 10,
      },
      create: {
        slug: s.slug,
        title: s.title,
        difficulty: s.difficulty,
        category: s.category,
        tier: tier,
        description: `Given problem **${s.title}** under step ${s.step} (${s.category}). Implement an optimal solution meeting time and space constraints.`,
        constraints: `- \`1 <= input.length <= 10^5\`\n- Optimal time complexity requirement: O(N) or O(N log N)`,
        companyTags: JSON.stringify(companyTagsList),
        acceptanceRate: Math.round((50 + (i % 40) + Math.random() * 5) * 10) / 10,
        examples: {
          create: [
            { input: '1 2 3 4 5', output: '1 2 3 4 5', explanation: 'Sample input output walkthrough.', orderIndex: 0 }
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

    seededCount++;
    if (seededCount % 50 === 0 || seededCount === specs.length) {
      console.log(`Progress: Upserted ${seededCount}/${specs.length} problems...`);
    }
  }

  const totalInDb = await prisma.problem.count();
  console.log(`\n🎉 DONE! Total problems in database: ${totalInDb}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
