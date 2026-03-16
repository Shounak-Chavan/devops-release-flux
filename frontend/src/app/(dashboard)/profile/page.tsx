"use client"

import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuthStore } from "@/lib/store/auth-store"
import { User, Mail, Shield, Camera, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ProfilePage() {
  const { user } = useAuthStore()
  const { toast } = useToast()

  const handleSave = () => {
    toast({
      title: "Profile updated",
      description: "Your changes have been saved successfully.",
    })
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-headline font-bold tracking-tight">Your Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your personal information and account security.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1 glass-card">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4 relative group">
                <Avatar className="h-32 w-32 border-4 border-primary/20">
                  <AvatarImage src="https://picsum.photos/seed/user-ff/200" alt="Avatar" />
                  <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                    {user?.name?.charAt(0) || "A"}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute bottom-0 right-1/2 translate-x-12 p-2 bg-primary text-primary-foreground rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <CardTitle>{user?.name || "Admin User"}</CardTitle>
              <CardDescription>{user?.email || "admin@example.com"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 text-emerald-500" />
                <span>Account verified</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <User className="h-4 w-4 text-primary" />
                <span>Administrator Role</span>
              </div>
            </CardContent>
          </Card>

          <div className="md:col-span-2 space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Personal Details</CardTitle>
                <CardDescription>Update your name and contact email.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="name" defaultValue={user?.name || "Admin User"} className="pl-10 bg-background/50" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" defaultValue={user?.email || "admin@example.com"} className="pl-10 bg-background/50" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSave} className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Profile
                </Button>
              </CardFooter>
            </Card>

            <Card className="glass-card border-destructive/20">
              <CardHeader>
                <CardTitle className="text-destructive">Account Security</CardTitle>
                <CardDescription>Change your password and manage security settings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" className="bg-background/50" />
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" className="bg-background/50" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input id="confirm-password" type="password" className="bg-background/50" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="border-destructive/20 hover:bg-destructive/5 text-destructive">
                  Update Password
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
