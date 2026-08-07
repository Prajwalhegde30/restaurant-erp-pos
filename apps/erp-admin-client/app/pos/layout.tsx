import { ReactNode } from 'react';

export default function PosLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-screen w-screen bg-background overflow-hidden">
      <header className="h-14 border-b bg-card flex items-center px-6 justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="font-bold text-xl tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Restaurant POS
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
          <div className="px-3 py-1 bg-muted rounded-full">Cashier: John Doe</div>
          <div className="px-3 py-1 bg-green-500/10 text-green-600 rounded-full flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            System Online
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
