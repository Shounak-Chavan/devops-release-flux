"use client";

/**
 * @file app/dashboard/layout.tsx
 * @description The shared layout shell for all dashboard pages.
 * Includes a collapsible dark sidebar, a top header with theme toggle,
 * and project selector. Wraps all children with the AuthGuard.
 */

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Flag,
  Settings,
  LogOut,
  Sun,
  Moon,
  Zap,
  ChevronRight,
} from "lucide-react";
import AuthGuard from "@/features/auth/components/AuthGuard";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import ProjectSelector from "@/features/project/components/ProjectSelector";
import { useFlagRealtimeSync } from "@/features/flags/hooks/useFlagRealtimeSync";

/** Navigation items in the sidebar. */
const navigation = [
  { name: "Overview",      href: "/dashboard",          icon: LayoutDashboard },
  { name: "Projects",      href: "/dashboard/projects", icon: FolderKanban },
  { name: "Feature Flags", href: "/dashboard/flags",    icon: Flag },
  { name: "Settings",      href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  /**
   * Signs the user out via Zustand and redirects to /login.
   */
  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  useFlagRealtimeSync();

  /** Derive the current page title from the navigation config. */
  const currentPage =
    navigation.find((n) => n.href === pathname)?.name ?? "Dashboard";

  return (
    <AuthGuard>
      <div
        className="flex min-h-screen"
        style={{ background: "var(--bg-base)" }}
      >
        {/* ----------------------------------------------------------------
            Sidebar
        ---------------------------------------------------------------- */}
        <aside
          className="flex w-60 flex-col border-r"
          style={{
            background: "var(--sidebar-bg)",
            borderColor: "var(--sidebar-border)",
          }}
        >
          {/* Logo */}
          <div
            className="flex h-16 items-center gap-3 border-b px-5"
            style={{ borderColor: "var(--sidebar-border)" }}
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0"
              style={{
                background: "var(--primary)",
                boxShadow: "0 0 16px var(--primary-glow)",
              }}
            >
              <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <span
              className="text-base font-bold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              FeatureFlow
            </span>
          </div>

          {/* Nav links */}
          <nav className="flex flex-col gap-1 p-3 flex-1" role="navigation" aria-label="Dashboard Navigation">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`nav-link ${isActive ? "active" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="flex-1">{item.name}</span>
                  {isActive && (
                    <ChevronRight
                      className="h-3.5 w-3.5 opacity-60"
                      style={{ color: "var(--primary)" }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar footer — user info + logout */}
          <div
            className="border-t p-3"
            style={{ borderColor: "var(--sidebar-border)" }}
          >
            <div
              className="flex items-center gap-3 rounded-lg p-2.5"
              style={{ background: "var(--bg-elevated)" }}
            >
              {/* User avatar (initials) */}
              <div
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold"
                style={{ background: "var(--primary-muted)", color: "var(--primary)" }}
                aria-hidden="true"
              >
                {user?.email?.[0]?.toUpperCase() ?? "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-xs font-medium truncate"
                  style={{ color: "var(--text-primary)" }}
                >
                  {user?.email}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Free plan
                </p>
              </div>
              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md transition-colors"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--status-danger)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--text-muted)")
                }
                title="Log out"
                aria-label="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* ----------------------------------------------------------------
            Main Content Area
        ---------------------------------------------------------------- */}
        <main className="flex flex-1 flex-col min-w-0">
          {/* Top Header */}
          <header
            className="flex h-16 items-center justify-between border-b px-6 flex-shrink-0"
            style={{
              background: "var(--sidebar-bg)",
              borderColor: "var(--sidebar-border)",
            }}
          >
            {/* Page title */}
            <h1
              className="text-base font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {currentPage}
            </h1>

            {/* Right side controls */}
            <div className="flex items-center gap-3">
              {/* Project selector dropdown */}
              <ProjectSelector />

              {/* Divider */}
              <div
                className="h-5 w-px"
                style={{ background: "var(--border-subtle)" }}
                aria-hidden="true"
              />

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-secondary)",
                }}
                aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </button>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 p-6 animate-fade-in-up overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}