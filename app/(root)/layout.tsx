import Topbar from "@/components/Topbar";
import Navbar from "@/components/Navbar";
import React from "react";
import Footer from "@/components/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-full min-h-screen select-none flex flex-col">
      <Topbar />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
