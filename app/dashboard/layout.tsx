"use client";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Home, LogOut, Settings, User, FileText, Plus, RefreshCw } from 'lucide-react';
import { useCallback } from 'react';
import { NavItem } from "../settings/nav-item";
import { useSession } from "@/lib/hooks/use-session";
import { handleSignOut } from "../login/actions";

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
    id: 'new-registration',
    label: 'Novo Registro',
    icon: Plus,
    path: '/dashboard/new-registration'
  },
  {
    id: 'documents',
    label: 'Documentos',
    icon: FileText,
    path: '/dashboard/documents'
  },
  {
    id: 'update',
    label: 'Atualização',
    icon: RefreshCw,
    path: '/dashboard/update'
  },
  {
    id: 'settings',
    label: 'Configurações',
    icon: Settings,
    path: '/settings'
  }
];

const SidebarNavigation = () => (
  <TooltipProvider>
    <aside className="flex h-full w-14 flex-col border-r bg-background">
      <div className="flex h-14 items-center justify-center border-b px-2">
        <img 
          src="/images/logo_dark_black.png"
          alt="CC Napoleão"
          width={32}
          height={32}
          className="transition-all group-hover:scale-110 dark:invert"
        />
      </div>
      
      <nav className="flex flex-1 flex-col items-center gap-2 p-2">
        {NAVIGATION_ITEMS.map((item) => (
          <NavItem
            key={item.id}
            href={item.path}
            label={item.label}
            variant="ghost"
          >
            <item.icon className="h-5 w-5" />
          </NavItem>
        ))}
      </nav>
    </aside>
  </TooltipProvider>
);

const TopBar = ({ onLogout }: { onLogout: () => void }) => {
  const { user, isLoading } = useSession();
  const getUserInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="flex h-14 items-center justify-between bg-background px-4">
      <h1 className="text-lg font-semibold"></h1>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.image || "/placeholder-user.jpg"} alt={user?.name || "Usuário"} />
              <AvatarFallback>
                {isLoading ? <User className="h-4 w-4" /> : getUserInitials(user?.name)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user?.name || 'Usuário'}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email || 'email@cartorio.com'}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Configurações</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onLogout} className="text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const handleLogout = useCallback(async () => {
    try {
      await handleSignOut();
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="flex h-screen bg-background">
      <SidebarNavigation />
      <div className="flex flex-1 flex-col">
        <TopBar onLogout={handleLogout} />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}