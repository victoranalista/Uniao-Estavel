"use client";

import { useRouter, usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Home, Users, LogOut } from 'lucide-react';
import { useCallback } from 'react';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: 'home',
    label: 'Início',
    icon: Home,
    path: '/dashboard'
  },
  {
    id: 'users',
    label: 'Usuários',
    icon: Users,
    path: '/dashboard/users'
  }
];

const NavigationButton = ({ 
  item, 
  isActive, 
  onClick 
}: {
  item: NavigationItem;
  isActive: boolean;
  onClick: () => void;
}) => {
  const IconComponent = item.icon;
  
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={
        isActive 
          ? 'hover:text-black text-white' 
          : 'text-white hover:text-gray-300'
      }
    >
      <IconComponent className="w-5 h-5 mr-2" />
      {item.label}
    </Button>
  );
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = useCallback((path: string) => {
    router.push(path);
  }, [router]);

  const handleLogout = useCallback(() => {
    router.push('/login');
  }, [router]);

  return (
    <div>
      <nav className="bg-black shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-4">
              {NAVIGATION_ITEMS.map((item) => (
                <NavigationButton
                  key={item.id}
                  item={item}
                  isActive={pathname === item.path}
                  onClick={() => handleNavigation(item.path)}
                />
              ))}
            </div>

            <div>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-white hover:text-gray-300"
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