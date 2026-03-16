"use client"

import { useAuthStore } from "@/lib/store/auth-store"
import Link from "next/link"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Search, User, LogOut, Settings as SettingsIcon, Globe } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function Navbar() {
  const { user, logout } = useAuthStore()

  return (
    <nav className="sticky top-0 z-40 flex h-[70px] w-full items-center justify-between border-b border-white/5 bg-[#020617] px-8">
      <div className="flex items-center gap-6 flex-1 max-w-2xl">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search projects, flags..." 
            className="pl-10 h-10 bg-[#0F172A] border-white/5 focus-visible:ring-primary/40 focus-visible:border-primary/40"
          />
        </div>
        
        <Select defaultValue="prod">
          <SelectTrigger className="w-[180px] h-10 bg-[#0F172A] border-white/5">
            <Globe className="mr-2 h-4 w-4 text-primary" />
            <SelectValue placeholder="Environment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="prod">Production</SelectItem>
            <SelectItem value="staging">Staging</SelectItem>
            <SelectItem value="dev">Development</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-full h-10 w-10">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2.5 right-2.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
          </span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative flex items-center gap-3 pl-2 pr-1 h-11 hover:bg-white/5 rounded-full transition-all">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-foreground leading-none">{user?.name || "Admin User"}</p>
                <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">{user?.email || "admin@example.com"}</p>
              </div>
              <Avatar className="h-9 w-9 border-2 border-primary/20 ring-offset-background group-hover:ring-2 ring-primary transition-all">
                <AvatarImage src="https://picsum.photos/seed/user-ff/200" alt="Avatar" />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user?.name?.charAt(0) || "A"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60 mt-2 glass-card">
            <DropdownMenuLabel>Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/5" />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center py-2.5 cursor-pointer">
                <User className="mr-3 h-4 w-4 text-muted-foreground" /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center py-2.5 cursor-pointer">
                <SettingsIcon className="mr-3 h-4 w-4 text-muted-foreground" /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/5" />
            <DropdownMenuItem className="text-destructive py-2.5 cursor-pointer" onClick={() => logout()}>
              <LogOut className="mr-3 h-4 w-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}
