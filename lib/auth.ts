if (process.env.VERCEL_ENV === 'preview')
  process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_BRANCH_URL}`;
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { prismaNeon } from './prismaNeon';
import { Role } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = prismaNeon;

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    maxAge: 24 * 60 * 60,
    updateAge: 25 * 60 * 60
  },
  pages: {
    signIn: '/login',
    error: '/login/unauthorized'
  },
  providers: [Google],
  callbacks: {
    signIn: async ({ user }) => {
      if (!user.email) return false;
      return await isAuthorizedEmail(user.email);
    },
    jwt: async ({ token, user }) => {
      if (user) {
        const dbUser = await prisma.userHistory.findFirst({
          where: { email: user.email!, status: 'ACTIVE' },
          orderBy: { version: 'desc' },
          select: { role: true, name: true }
        });
        token.name = dbUser?.name;
        token.email = user.email;
        token.role = dbUser?.role;
      }
      return token;
    },
    session: async ({ session, token }) => {
      session.user.name = token.name;
      const role = token.role;
      const isValidRole = isRecognizedRole(role);
      if (isValidRole) session.user.role = role;
      return session;
    },
    redirect: async ({ url, baseUrl }) => {
      try {
        const parsedUrl = new URL(url, baseUrl);
        const callbackUrl = parsedUrl.searchParams.get('callbackUrl');
        if (callbackUrl && callbackUrl.startsWith(baseUrl)) return callbackUrl;
        else if (parsedUrl.pathname === '/login') return baseUrl + '/posting';
      } catch (error) {
        console.error('Error parsing URL in callback redirect:', error);
      }
      if (url.startsWith(baseUrl)) return url;
      return `${baseUrl}/posting`;
    },
    authorized: ({ request, auth }) => {
      if (!!auth === false) return !!auth;
      const pathname = request.nextUrl.pathname;
      if (pathname.startsWith('/settings')) {
        if (auth.user.role !== 'ADMIN') {
          const url = request.nextUrl.clone();
          url.pathname = '/dashboard/unauthorized';
          return NextResponse.redirect(url);
        }
      }
      return true;
    }
  }
});

const isAuthorizedEmail = async (email: string) => {
  const dbUser = await prisma.userHistory.findFirst({
    where: { email, status: 'ACTIVE' },
    orderBy: { version: 'desc' }
  });
  return !!dbUser;
};

const isRecognizedRole = (role: unknown): role is Role =>
  Object.values(Role).includes(role as Role);