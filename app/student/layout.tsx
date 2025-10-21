"use client";

import React from "react";
import AppSidebar from "@/components/student/AppSidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Loader from "@/components/Loader";
import { useStudentAuth } from "@/hooks/useStudentAuth";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useStudentAuth();

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
