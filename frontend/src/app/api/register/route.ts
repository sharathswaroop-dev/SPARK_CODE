import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  tier: z.enum(['free', 'mid', 'pro']).default('free'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: 'Invalid fields', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, password, tier } = parsed.data;

    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return Response.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    // Create user. In local dev, we store the password in plaintext or simple mock.
    // We will store plaintext since it's verified in auth.ts with plaintext check.
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password, // plaintext for dev convenience (auth.ts handles it)
        tier,
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
    return Response.json({ error: err.message || 'An error occurred' }, { status: 500 });
  }
}
