import type { SupportedLanguage } from '@/lib/piston';

export type UserTier = 'free' | 'mid' | 'pro';

export type { SupportedLanguage };

export type Verdict =
  | 'ACCEPTED'
  | 'WRONG_ANSWER'
  | 'RUNTIME_ERROR'
  | 'TIME_LIMIT_EXCEEDED'
  | 'COMPILATION_ERROR'
  | 'MEMORY_LIMIT_EXCEEDED';

// Shape returned from /api/execute
export interface ExecuteResponse {
  stdout: string;
  stderr: string;
  exitCode: number;
}

// Shape returned from /api/judge
export interface JudgeResponse {
  verdict: Verdict;
  stdout: string;
  stderr: string;
  passedCases: number;
  totalCases: number;
  runtime?: number;
}

// Problem as returned from /api/problems
export interface ProblemSummary {
  id: string;
  slug: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  tier: UserTier;
  acceptanceRate: number;
  companyTags?: string;
}

export interface ProblemDetail extends ProblemSummary {
  description: string;
  constraints: string;
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  starterCode: Partial<Record<SupportedLanguage, string>>;
}

// Augment NextAuth session type
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      tier: string;
    };
  }
}
