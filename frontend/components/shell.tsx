"use client"

import React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-[#f3f3f3] p-0 md:p-6">
        <AppSidebar />

        <SidebarInset className="min-w-0 flex-1 bg-transparent">
          <div className="min-h-screen w-full">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

export default Shell
