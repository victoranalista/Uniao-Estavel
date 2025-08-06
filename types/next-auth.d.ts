import { Role } from '@prisma/client';
import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      user: any;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: Role;
    };
  }
}
