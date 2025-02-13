"use client";

import { useRouter, usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Home, Users, LogOut } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    router.push('/login');
  };

  const handleHome = () => {
    router.push('/dashboard');
  };

  const handleUsers = () => {
    router.push('/dashboard/users');
  };

  return (
    <div>
      <nav className="bg-black shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={handleHome}
                className={pathname === '/dashboard' ? 'hover:text-black text-white' : 'text-white'}
              >
                <Home className="w-5 h-5 mr-2" />
                Início
              </Button>
              <Button
                variant="ghost"
                onClick={handleUsers}
                className={pathname === '/dashboard/users' ? 'hover:text-black text-white' : 'text-white'}
              >
                <Users className="w-5 h-5 mr-2" />
                Usuários
              </Button>
            </div>

            <div>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-white hover:text-gray-900"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}