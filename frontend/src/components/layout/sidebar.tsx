"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  FolderKanban, 
  Flag, 
  History, 
  Settings, 
  Terminal,
  Zap,
  ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Feature Flags', href: '/flags', icon: Flag },
  { name: 'Audit Logs', href: '/audit', icon: History },
  { name: 'Simulator', href: '/simulator', icon: Terminal },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-[260px] flex-col border-r border-white/5 bg-[#020617]">
      <div className="flex h-[70px] items-center px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Zap className="h-5 w-5 fill-current" />
          </div>
          <span className="font-headline tracking-tight text-foreground">FeatureFlow</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide">
        <div className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center justify-between rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-[#1E293B] text-[#F8FAFC]" 
                    : "text-muted-foreground hover:bg-[#111827] hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={cn("h-4.5 w-4.5 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                  {item.name}
                </div>
                {isActive && <ChevronRight className="h-3.5 w-3.5 opacity-50" />}
              </Link>
            )
          })}
        </div>
      </div>

      <div className="mt-auto border-t border-white/5 p-5">
        <div className="rounded-xl bg-primary/5 p-4 border border-primary/10">
          <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Platform Status</p>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-xs font-medium text-foreground">Operational</span>
          </div>
        </div>
      </div>
    </div>
  )
}
