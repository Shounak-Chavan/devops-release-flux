"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FolderKanban, Flag, Settings, LogOut } from "lucide-react";
import AuthGuard from "../../src/features/auth/components/AuthGuard";
import { useAuthStore } from "../../src/store/authStore";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { name: "Feature Flags", href: "/dashboard/flags", icon: Flag },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuthStore();

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gray-50">
        
        {/* Sidebar */}
        <aside className="w-64 border-r border-gray-200 bg-white">
          <div className="flex h-16 items-center border-b border-gray-200 px-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <span className="font-bold text-white">FF</span>
            </div>
            <span className="ml-3 text-lg font-bold text-gray-900">FeatureFlow</span>
          </div>

          <nav className="flex flex-col gap-1 p-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? "text-blue-700" : "text-gray-400"}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex flex-1 flex-col">
          
          {/* Top Header */}
          <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-8">
            <h1 className="text-xl font-semibold text-gray-900">
              {navigation.find((n) => n.href === pathname)?.name || "Dashboard"}
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg p-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-red-600 transition-colors"
                title="Log out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 p-8">
            {children}
          </div>
          
        </main>
      </div>
    </AuthGuard>
  );
}