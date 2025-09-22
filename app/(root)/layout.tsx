import Topbar from '@/components/Topbar';
import Navbar from '@/components/Navbar';
import React from 'react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
  }>) {
  return (
            <div className="w-full min-h-screen select-none">
                <Topbar/>
                <Navbar/>
              <main className="flex-1">{children}</main>
            </div>
          );
}
