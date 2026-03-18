"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../../store/authStore";
import { Loader2 } from "lucide-react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading, initializeAuth } = useAuthStore();

  // Initialize Auth on the first load to check for existing Supabase sessions
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Redirect if finished loading and no user is found
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  // Show a loading spinner while checking the session
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Prevent UI flashing before the redirect happens
  if (!user) return null;

  // If logged in, render the dashboard content
  return <>{children}</>;
}