'use client';

import { Bell, User, ChevronRight, Home } from 'lucide-react';
import { Button } from '@repo/ui';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export function Header() {
  const pathname = usePathname();
  const paths = pathname.split('/').filter(Boolean);

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card px-6 sticky top-0 z-30">
      <div className="flex-1 flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Link href="/admin" className="hover:text-primary transition-colors flex items-center">
          <Home className="h-4 w-4" />
        </Link>
        {paths.length > 1 &&
          paths.slice(1).map((segment, index) => (
            <div key={index} className="flex items-center gap-2 capitalize">
              <ChevronRight className="h-4 w-4 opacity-50" />
              <span
                className={
                  index === paths.length - 2
                    ? 'text-foreground font-semibold'
                    : 'hover:text-primary transition-colors cursor-pointer'
                }
              >
                {segment.replace(/-/g, ' ')}
              </span>
            </div>
          ))}
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <Bell className="h-4 w-4" />
          <span className="sr-only">Notifications</span>
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          <User className="h-5 w-5" />
          <span className="sr-only">Profile</span>
        </Button>
      </div>
    </header>
  );
}
