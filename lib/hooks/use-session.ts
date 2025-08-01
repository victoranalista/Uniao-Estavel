'use client';

import { useSession as useNextAuthSession } from 'next-auth/react';
import type { Role } from '@prisma/client';

interface SessionUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: Role;
}

interface CustomSession {
  user: SessionUser;
}

export const useSession = () => {
  const { data: session, status } = useNextAuthSession();
  
  return {
    user: session?.user as SessionUser | undefined,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    status
  };
};