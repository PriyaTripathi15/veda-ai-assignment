"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  BellRing,
  BookOpen,
  ChevronRight,
  FileText,
  HelpCircle,
  History,
  Home,
  Settings,
  Sparkles,
  Users,
} from "lucide-react"
import { useAssessmentStore } from "@/store/use-assessment-store"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

const mainNavItems = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "My Groups",
    url: "#",
    icon: Users,
  },
  {
    title: "Assignments",
    url: "#",
    icon: FileText,
  },
  {
    title: "AI Teacher's Toolkit",
    url: "#",
    icon: Sparkles,
  },
  {
    title: "My Library",
    url: "#",
    icon: BookOpen,
    badge: "32",
  },
]

const supportItems = [
  {
    title: "History",
    url: "#",
    icon: History,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
  {
    title: "Help & Support",
    url: "#",
    icon: HelpCircle,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { setShowBuilder } = useAssessmentStore()

  return (
    <Sidebar
      collapsible="none"
      className="border-none bg-transparent"
    >
      <div className="flex h-full flex-col rounded-[34px] bg-white px-5 py-6">
        {/* LOGO */}
        <SidebarHeader className="p-0">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-[#ff8c5a] via-[#ff6f61] to-[#7b001c]">
              <Sparkles className="h-5 w-5 text-white" />
            </div>

            <div className="group-data-[collapsible=icon]:hidden">
              <h2 className="text-[22px] font-semibold text-[#232323]">
                VedaAI
              </h2>

              <p className="text-xs text-[#8d8d92]">
                Smart Assessment Platform
              </p>
            </div>
          </Link>
        </SidebarHeader>

        {/* CREATE BUTTON */}
        <div className="mt-10">
          <button
            type="button"
            onClick={() => setShowBuilder(true)}
            className="flex h-14.5 w-full items-center justify-center gap-2 rounded-full border-[3px] border-[#ff8b59] bg-[#26262a] text-[16px] font-medium text-white transition-all hover:bg-black"
          >
            <Sparkles className="h-4 w-4" />
            <span className="group-data-[collapsible=icon]:hidden">
              Create Assignment
            </span>
          </button>
        </div>

        {/* MAIN MENU */}
        <SidebarContent className="mt-12 flex-1">
          <div>
            <p className="mb-5 px-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#9a9aa0] group-data-[collapsible=icon]:hidden">
              Main Menu
            </p>

            <SidebarMenu className="space-y-2">
              {mainNavItems.map((item) => {
                const isActive =
                  pathname === item.url && item.url !== "#"

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={isActive}
                      className={`h-13.5 rounded-2xl px-4 transition-all ${
                        isActive
                          ? "bg-[#f5f5f7] text-[#232323]"
                          : "text-[#8c8c92] hover:bg-[#f5f5f7] hover:text-[#232323]"
                      }`}
                    >
                      {item.title === "Assignments" ? (
                        <button
                          onClick={() => {
                            setShowBuilder(false)
                            router.push("/")
                          }}
                          className="flex items-center justify-between w-full"
                        >
                          <div className="flex items-center gap-3">
                            <item.icon className="h-5 w-5" />

                            <span className="text-[15px] font-medium group-data-[collapsible=icon]:hidden">
                              {item.title}
                            </span>
                          </div>

                          <ChevronRight className="h-4 w-4 opacity-40 group-data-[collapsible=icon]:hidden" />
                        </button>
                      ) : item.title === "AI Teacher's Toolkit" ? (
                        <button
                          onClick={() => router.push("/toolkit")}
                          className="flex items-center justify-between w-full"
                        >
                          <div className="flex items-center gap-3">
                            <item.icon className="h-5 w-5" />

                            <span className="text-[15px] font-medium group-data-[collapsible=icon]:hidden">
                              {item.title}
                            </span>
                          </div>

                          <ChevronRight className="h-4 w-4 opacity-40 group-data-[collapsible=icon]:hidden" />
                        </button>
                      ) : (
                        <Link
                          href={item.url}
                          className="flex items-center justify-between w-full"
                        >
                          <div className="flex items-center gap-3">
                            <item.icon className="h-5 w-5" />

                            <span className="text-[15px] font-medium group-data-[collapsible=icon]:hidden">
                              {item.title}
                            </span>
                          </div>

                          {item.badge && (
                            <div className="rounded-full bg-[#ff7e3f] px-2.5 py-1 text-xs font-semibold text-white group-data-[collapsible=icon]:hidden">
                              {item.badge}
                            </div>
                          )}

                          {!item.badge && (
                            <ChevronRight className="h-4 w-4 opacity-40 group-data-[collapsible=icon]:hidden" />
                          )}
                        </Link>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </div>

          {/* SUPPORT */}
          <div className="mt-12">
            <p className="mb-5 px-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#9a9aa0] group-data-[collapsible=icon]:hidden">
              Support
            </p>

            <SidebarMenu className="space-y-2">
              {supportItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    className="h-13.5 rounded-2xl px-4 text-[#8c8c92] transition-all hover:bg-[#f5f5f7] hover:text-[#232323]"
                  >
                    <Link
                      href={item.url}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />

                        <span className="text-[15px] font-medium group-data-[collapsible=icon]:hidden">
                          {item.title}
                        </span>
                      </div>

                      <ChevronRight className="h-4 w-4 opacity-40 group-data-[collapsible=icon]:hidden" />
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </div>
        </SidebarContent>

        {/* FOOTER */}
        <SidebarFooter className="mt-8 p-0">
          <div className="rounded-[28px] bg-[#f5f5f7] p-4 transition-all hover:bg-[#efeff1]">
            <div className="flex items-center gap-3">
              <Avatar className="h-14 w-14 border-2 border-white">
                <AvatarImage src="/placeholder-user.jpg" />

                <AvatarFallback className="bg-linear-to-br from-[#ff8c5a] to-[#7b001c] text-white">
                  JD
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 group-data-[collapsible=icon]:hidden">
                <h3 className="text-[15px] font-semibold text-[#232323]">
                  John Doe
                </h3>

                <p className="mt-1 text-xs text-[#8c8c92]">
                  john@school.edu
                </p>
              </div>

              <button
                type="button"
                className="group-data-[collapsible=icon]:hidden"
              >
                <BellRing className="h-5 w-5 text-[#666]" />
              </button>
            </div>
          </div>
        </SidebarFooter>
      </div>
    </Sidebar>
  )
}