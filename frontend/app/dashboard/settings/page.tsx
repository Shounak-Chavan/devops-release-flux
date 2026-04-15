"use client";

/**
 * @file app/dashboard/settings/page.tsx
 * @description Enterprise Settings Page.
 * Features polished account management, theme preferences, and secure zone actions.
 */

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import { useRouter } from "next/navigation";
import {
  User, Palette, LogOut, Sun, Moon,
  AlertTriangle, Copy, CheckCircle2, Shield
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const [copiedId, setCopiedId] = useState(false);

  const handleLogout = async () => {
    await signOut();
    toast.success("Signed out successfully.");
    router.push("/login");
  };

  const handleCopyId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
      toast.success("User ID copied to clipboard");
    }
  };

  return (
    <div className="space-y-8 max-w-3xl animate-fade-in-up pb-12">
      {/* ---- Page Header ---- */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Personal Settings
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Manage your account profile, preferences, and security.
        </p>
      </div>

      {/* ---- Account Profile Section ---- */}
      <section className="card overflow-hidden border border-[var(--border-subtle)]">
        <div className="flex items-center gap-3 border-b px-6 py-5 bg-[var(--bg-elevated)] border-[var(--border-subtle)]">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
            <User className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Account Profile</h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Your identity on FeatureFlow.</p>
          </div>
        </div>

        <div className="p-6 space-y-6 bg-[var(--card-bg)]">
          {/* Avatar & Email */}
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full text-xl font-bold border-2" 
                 style={{ background: "var(--primary-muted)", color: "var(--primary)", borderColor: "var(--border-subtle)" }}>
              {user?.email?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div>
              <p className="text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Email Address</p>
              <p className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>{user?.email}</p>
            </div>
          </div>

          <hr style={{ borderColor: "var(--border-subtle)" }} />

          {/* User ID */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>User ID</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                Your unique identifier. Useful for testing targeting rules in the SDK.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg p-1.5 pl-3">
              <code className="text-xs font-mono" style={{ color: "var(--text-secondary)" }}>
                {user?.id ?? "—"}
              </code>
              <button
                onClick={handleCopyId}
                className="flex h-7 w-7 items-center justify-center rounded transition-colors hover:bg-[var(--primary-muted)] hover:text-[var(--primary)] text-[var(--text-muted)]"
                title="Copy User ID"
              >
                {copiedId ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Appearance Section ---- */}
      <section className="card overflow-hidden border border-[var(--border-subtle)]">
        <div className="flex items-center gap-3 border-b px-6 py-5 bg-[var(--bg-elevated)] border-[var(--border-subtle)]">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-500">
            <Palette className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Appearance</h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Customize your workspace.</p>
          </div>
        </div>

        <div className="p-6 bg-[var(--card-bg)] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Interface Theme</p>
            <p className="text-xs mt-1 max-w-sm" style={{ color: "var(--text-muted)" }}>
              Select or customize your UI theme. FeatureFlow defaults to the "Obsidian Dark" theme for late-night shipping.
            </p>
          </div>

          {/* Segmented Control for Theme */}
          <div className="flex items-center p-1 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
            <button
              onClick={() => setTheme("light")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                theme === "light" 
                  ? "bg-white text-zinc-900 shadow-sm" 
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Sun className="h-4 w-4" /> Light
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                theme === "dark" 
                  ? "bg-zinc-800 text-white shadow-sm border border-zinc-700" 
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Moon className="h-4 w-4" /> Dark
            </button>
          </div>
        </div>
      </section>

      {/* ---- Security & Danger Zone ---- */}
      <section className="rounded-2xl overflow-hidden border border-rose-500/30 bg-rose-500/5">
        <div className="flex items-center gap-3 border-b border-rose-500/20 px-6 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/20 text-rose-500">
            <Shield className="h-4 w-4" />
          </div>
          <h3 className="text-base font-bold text-rose-500">Session Security</h3>
        </div>

        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-[var(--text-primary)]">Sign Out Everywhere</p>
            <p className="text-xs mt-1 max-w-sm text-[var(--text-secondary)]">
              End your current session. You will need to re-authenticate with your email and password to access your projects.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="btn-danger whitespace-nowrap h-10 px-6"
          >
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </button>
        </div>
      </section>
    </div>
  );
}