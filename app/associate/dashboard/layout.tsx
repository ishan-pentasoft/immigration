"use client";

import React from "react";
import AppSidebar from "@/components/associate/AppSidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useAssociateAuth } from "@/hooks/useAssociateAuth";
import Loader from "@/components/Loader";

export default function AssociateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useAssociateAuth();

  if (isLoading) return <Loader />;
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
