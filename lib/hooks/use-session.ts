'use client';
import { useSession as useNextAuthSession } from 'next-auth/react';
import { useMemo } from 'react';
import type { Role } from '@prisma/client';

interface SessionUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: Role;
}

export const useSession = () => {
  const { data: session, status } = useNextAuthSession();
  const user = useMemo(
    () => session?.user as SessionUser | undefined,
    [session?.user]
  );
  const isAuthenticated = useMemo(() => status === 'authenticated', [status]);
  const isLoading = useMemo(() => status === 'loading', [status]);
  return useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      status
    }),
    [user, isAuthenticated, isLoading, status]
  );
};
