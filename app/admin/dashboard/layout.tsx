"use client";

import React from "react";
import AppSidebar from "@/components/AppSidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="relative">
          <SidebarTrigger className="absolute left-2 top-2 cursor-pointer" />
        </div>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
