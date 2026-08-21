import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const providers: any[] = [];

// Add Google provider only if credentials are provided in environment
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

// Add GitHub provider only if credentials are provided in environment
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  providers.push(
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

// Always include Credentials provider
providers.push(
  Credentials({
    name: 'Credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      const parsed = credentialsSchema.safeParse(credentials);
      if (!parsed.success) return null;

      const email = parsed.data.email.trim();
      const user = await prisma.user.findFirst({
        where: {
          email: { equals: email, mode: 'insensitive' },
        },
      });

      if (!user || !user.password) return null;

      // 1. Verify bcrypt hash
      let isValid = false;
      try {
        isValid = await bcrypt.compare(parsed.data.password, user.password);
      } catch {
        isValid = false;
      }

      // 2. Legacy fallback: if seeded with plaintext, compare & seamlessly upgrade to bcrypt
      if (!isValid && parsed.data.password === user.password) {
        isValid = true;
        try {
          const upgradedHash = await bcrypt.hash(parsed.data.password, 12);
          await prisma.user.update({
            where: { id: user.id },
            data: { password: upgradedHash },
          });
        } catch (_) {
          // Ignore upgrade failure; user is still authenticated
        }
      }

      if (!isValid) return null;

      return { id: user.id, name: user.name, email: user.email, image: user.image };
    },
  })
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'sparkcode-secure-production-secret-key-32chars',
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
        // Fetch current tier from DB on sign-in
        try {
          const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
          token.tier = dbUser?.tier ?? 'free';
        } catch (_) {
          token.tier = 'free';
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.tier = (token.tier as string) ?? 'free';
      }
      return session;
    },
  },
  pages: {
    signIn: '/signin',
    error: '/signin', // Redirect configuration errors cleanly back to the signin screen
  },
});
