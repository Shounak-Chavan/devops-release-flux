"use client";

/**
 * @file AuthGuard.tsx
 * @description Route protection component for the dashboard.
 * Initializes the Supabase auth session on mount and redirects
 * unauthenticated users to /login. Shows a themed loading screen
 * while the session check is in progress.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Loader2, Zap } from "lucide-react";

/**
 * AuthGuard wraps protected routes.
 * - If session is loading → shows a full-screen spinner
 * - If no user after loading → redirects to /login
 * - If authenticated → renders children
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading, initializeAuth } = useAuthStore();

  // Initialize the Supabase auth state listener on first mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Once loading is complete, redirect if no user is found
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  // Full-screen loading spinner while session check is in progress
  if (isLoading) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-4"
        style={{ background: "var(--bg-base)" }}
        role="status"
        aria-label="Loading session"
      >
        {/* Animated logo */}
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl"
          style={{
            background: "var(--primary)",
            boxShadow: "0 0 24px var(--primary-glow)",
          }}
        >
          <Zap className="h-6 w-6 text-white" strokeWidth={2.5} />
        </div>
        <Loader2
          className="h-5 w-5 animate-spin"
          style={{ color: "var(--text-muted)" }}
        />
      </div>
    );
  }

  // Prevent flash of dashboard content before redirect fires
  if (!user) return null;

  // User is authenticated — render the protected content
  return <>{children}</>;
}