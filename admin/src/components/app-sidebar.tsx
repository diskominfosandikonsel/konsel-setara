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
  Video,
  KeyRound,
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
import { fetchMyAccessGroup, getStoredAccessGroup, hasPermission } from "@/lib/permissions"

const navGroups = [
  {
    label: "Dashboard",
    items: [
      {
        title: "Dashboard SKM",
        url: "/dashboard",
        icon: LayoutDashboard,
        permissionKey: "dashboard",
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
        permissionKey: "realisasi",
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
        permissionKey: "ulasan",
      },
      {
        title: "Aplikasi / Layanan",
        url: "/aplikasi",
        icon: AppWindow,
        permissionKey: "aplikasi",
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
        permissionKey: "slider",
      },
      {
        title: "Menu Dinamis",
        url: "/menu",
        icon: Menu,
        permissionKey: "menu",
      },
      {
        title: "Video Konsel",
        url: "/video-konsel",
        icon: Video,
        permissionKey: "video_konsel",
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
        permissionKey: "users",
      },
      {
        title: "Hak Akses Pegawai",
        url: "/pegawai",
        icon: ShieldCheck,
        permissionKey: "pegawai",
      },
      {
        title: "Kelompok & Hak Akses",
        url: "/access-groups",
        icon: KeyRound,
        permissionKey: "access_groups",
      },
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const profile = getProfile()
  const role = Number(profile?.menu_klp)
  const [accessGroup, setAccessGroup] = React.useState(getStoredAccessGroup())

  React.useEffect(() => {
    const refresh = () => setAccessGroup(getStoredAccessGroup())
    window.addEventListener('access-permissions-changed', refresh)
    fetchMyAccessGroup().then(setAccessGroup).catch(() => undefined)
    return () => window.removeEventListener('access-permissions-changed', refresh)
  }, [])

  const user = {
    name: profile?.nama || "Admin",
    email: profile?.opd || profile?.email || "admin@konselsetara.go.id",
    avatar: "",
  }

  const filteredNavGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => hasPermission(item.permissionKey, 'read', accessGroup)),
    }))
    .filter((group) => group.items.length > 0)

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
                    {accessGroup?.name || (role === 2 ? "Admin OPD" : "Admin Panel")}
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
