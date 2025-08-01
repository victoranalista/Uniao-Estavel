'use client';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function NavItem({
  href,
  label,
  children,
  variant = 'ghost'
}: {
  href: string;
  label: string;
  children: React.ReactNode;
  variant?: 'ghost' | 'outline' | 'secondary';
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={isActive ? 'default' : variant}
          size="icon"
          className={cn(
            'h-9 w-9 transition-all duration-200',
            'hover:scale-110 hover:shadow-md',
            isActive && 'shadow-lg',
            !isActive && 'hover:bg-accent hover:text-accent-foreground'
          )}
          asChild
        >
          <Link href={href} prefetch>
            {children}
            <span className="sr-only">{label}</span>
          </Link>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right" className="font-medium">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
