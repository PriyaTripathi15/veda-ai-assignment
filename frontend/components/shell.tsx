"use client"

import React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-[#f3f3f3] p-0 md:p-6">
        <AppSidebar />

        <SidebarInset className="min-w-0 flex-1 bg-transparent">
          {/* Mobile top bar: menu trigger and title */}
          <div className="md:hidden border-b border-[#e8e8ea] bg-white p-3">
            <div className="flex items-center justify-between">
              <SidebarTrigger className="rounded-md p-2" />
              <div className="text-lg font-semibold text-[#222]">VedaAI</div>
              <div />
            </div>
          </div>

          <div className="min-h-screen w-full px-3 md:px-12">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

export default Shell
