import type { Metadata } from 'next';
import Providers from './providers';
import './globals.css';
import { Toaster } from '@repo/ui';

export const metadata: Metadata = {
  title: 'Restaurant ERP + POS',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
