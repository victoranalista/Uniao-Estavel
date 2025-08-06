'use client';
import { SessionProvider } from 'next-auth/react';
import { ReactNode, Suspense } from 'react';

const SessionWrapper = ({ children }: { children: ReactNode }) => (
  <Suspense
    fallback={
      <div className="flex items-center justify-center h-screen">
        Carregando...
      </div>
    }
  >
    {children}
  </Suspense>
);

export const ClientSessionProvider = ({
  children
}: {
  children: ReactNode;
}) => (
  <SessionProvider>
    <SessionWrapper>{children}</SessionWrapper>
  </SessionProvider>
);
