"use client";

/**
 * @file LoginForm.tsx
 * @description The login form component styled with the FeatureFlow Obsidian Dark design system.
 * Uses Supabase Auth directly on the client (best practice — keeps auth logic in one layer)
 * and the Zustand auth store's onAuthStateChange listener picks up the new session automatically.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Loader2, Eye, EyeOff, Zap } from "lucide-react";
import { supabase } from "@/config/supabase";

/**
 * LoginForm — Renders an email/password login form.
 * On success, the router pushes to /dashboard; the Zustand authStore
 * picks up the session change via its onAuthStateChange listener.
 */
export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handles form submission.
   * Calls supabase.auth.signInWithPassword and navigates on success.
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setIsLoading(false);
    } else {
      // The Zustand authStore will automatically pick up the new session
      router.push("/dashboard");
    }
  };

  return (
    <div
      className="w-full max-w-md rounded-2xl p-8"
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
        boxShadow: "var(--card-shadow)",
      }}
    >
      {/* Logo + Header */}
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl"
            style={{
              background: "var(--primary)",
              boxShadow: "0 0 24px var(--primary-glow)",
            }}
          >
            <Zap className="h-6 w-6 text-white" strokeWidth={2.5} />
          </div>
        </div>
        <h2
          className="text-2xl font-bold tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          Welcome back
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Sign in to manage your feature flags.
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        {/* Error message */}
        {error && <div className="alert-error">{error}</div>}

        {/* Email field */}
        <div>
          <label
            htmlFor="login-email"
            className="block text-sm font-medium mb-1.5"
            style={{ color: "var(--text-secondary)" }}
          >
            Email Address
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <Mail className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
            </div>
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input pl-10"
              placeholder="you@company.com"
            />
          </div>
        </div>

        {/* Password field */}
        <div>
          <label
            htmlFor="login-password"
            className="block text-sm font-medium mb-1.5"
            style={{ color: "var(--text-secondary)" }}
          >
            Password
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <Lock className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
            </div>
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input pl-10 pr-10"
              placeholder="••••••••"
            />
            {/* Toggle password visibility */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
              ) : (
                <Eye className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
              )}
            </button>
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          id="login-submit-btn"
          className="btn-primary w-full py-2.5 rounded-lg"
          style={{ fontSize: "15px" }}
        >
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign In"}
        </button>
      </form>

      {/* Signup link */}
      <p className="mt-6 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-semibold transition-colors"
          style={{ color: "var(--primary)" }}
        >
          Sign up for free
        </Link>
      </p>
    </div>
  );
}