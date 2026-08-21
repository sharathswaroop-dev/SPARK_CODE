import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const email = parsed.data.email.toLowerCase().trim();
        const user = await prisma.user.findUnique({
          where: { email },
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
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
        // Fetch current tier from DB on sign-in
        const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
        token.tier = dbUser?.tier ?? 'free';
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
  },
});
