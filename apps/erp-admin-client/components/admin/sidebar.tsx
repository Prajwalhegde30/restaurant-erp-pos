'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Store,
  Users,
  Shield,
  Settings,
  LayoutDashboard,
  Utensils,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Branches', href: '/admin/branches', icon: Store },
  { name: 'Staff', href: '/admin/staff', icon: Users },
  { name: 'Roles', href: '/admin/roles', icon: Shield },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
  { name: 'Catalog', href: '/admin/catalog', icon: Utensils },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex h-14 items-center border-b px-4">
        <span className="text-lg font-bold">Admin POS</span>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-primary/10 text-primary hover:bg-primary/15'
                  : 'hover:bg-accent hover:text-accent-foreground text-muted-foreground'
              }`}
            >
              <item.icon
                className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-accent-foreground'}`}
              />
              <span className="flex-1">{item.name}</span>
              {isActive && <ChevronRight className="h-4 w-4 opacity-70" />}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
