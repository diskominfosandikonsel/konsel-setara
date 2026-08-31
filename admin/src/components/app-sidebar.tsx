"use client"

import * as React from "react"
import {
  LayoutDashboard,
  MessageSquare,
  AppWindow,
  Image,
  Menu,
  Users,
  Award,
  ShieldCheck,
} from "lucide-react"
import { Link } from "react-router-dom"
import { Logo } from "@/components/logo"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { getProfile } from "@/lib/auth"

const navGroups = [
  {
    label: "Dashboard",
    items: [
      {
        title: "Dashboard SKM",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Program Prioritas",
    items: [
      {
        title: "Realisasi Setara",
        url: "/realisasi",
        icon: Award,
      },
    ],
  },
  {
    label: "Survei Kepuasan",
    items: [
      {
        title: "Ulasan & Komentar",
        url: "/ulasan",
        icon: MessageSquare,
      },
      {
        title: "Aplikasi / Layanan",
        url: "/aplikasi",
        icon: AppWindow,
      },
    ],
  },
  {
    label: "Kelola Konten",
    items: [
      {
        title: "Slider / Banner",
        url: "/slider",
        icon: Image,
      },
      {
        title: "Menu Dinamis",
        url: "/menu",
        icon: Menu,
      },
    ],
  },
  {
    label: "Administrasi",
    items: [
      {
        title: "Manajemen User",
        url: "/users",
        icon: Users,
      },
      {
        title: "Hak Akses Pegawai",
        url: "/pegawai",
        icon: ShieldCheck,
      },
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const profile = getProfile()
  const role = Number(profile?.menu_klp)

  const user = {
    name: profile?.nama || "Admin",
    email: profile?.opd || profile?.email || "admin@konselsetara.go.id",
    avatar: "",
  }

  // Filter menu based on role:
  // Role 2 (Pegawai OPD) ONLY sees Dashboard & Realisasi Setara
  const filteredNavGroups = navGroups.filter((group) => {
    if (role === 2) {
      return group.label === "Dashboard" || group.label === "Program Prioritas"
    }
    return true
  })

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Logo size={28} />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Konsel Setara</span>
                  <span className="truncate text-xs">
                    {role === 2 ? "Portal Pegawai OPD" : "Admin Panel"}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {filteredNavGroups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
