import React from 'react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
            <div className="w-full min-h-screen select-none">
              <main className="flex-1">{children}</main>
            </div>
          );
}
