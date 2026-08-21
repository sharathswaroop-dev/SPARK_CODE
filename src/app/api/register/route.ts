import { NextRequest } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(128),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Apply rate limit: max 5 registration attempts per IP per 15 minutes
    const clientIp = getClientIp(request);
    const rl = rateLimit(`register:${clientIp}`, { windowSeconds: 15 * 60, maxRequests: 5 });
    if (!rl.success) {
      return Response.json(
        { error: `Too many registration attempts. Please try again in ${rl.resetSeconds} seconds.` },
        { status: 429 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: 'Invalid registration fields', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    // 2. Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return Response.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    // 3. Hash password using bcrypt (12 salt rounds)
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4. Create user with strictly enforced 'free' tier (prevents privilege escalation)
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        tier: 'free',
      },
    });

    return Response.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        tier: user.tier,
      },
    });
  } catch (err: any) {
    console.error('[/api/register] Registration error:', err);
    return Response.json({ error: 'An unexpected error occurred during registration' }, { status: 500 });
  }
}
