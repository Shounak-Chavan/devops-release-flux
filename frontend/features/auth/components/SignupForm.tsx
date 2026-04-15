"use client";

/**
 * @file SignupForm.tsx
 * @description The signup / registration form styled with the FeatureFlow Obsidian Dark design system.
 * Validates that the password meets minimum requirements before submitting.
 * Uses Supabase Auth directly on the client — consistent with LoginForm pattern.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Loader2, Eye, EyeOff, Zap, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/config/supabase";

/** Minimum password length enforced by Supabase defaults. */
const MIN_PASSWORD_LENGTH = 6;

/**
 * SignupForm — Renders an email/password registration form.
 * Includes a password strength indicator and field-level validation feedback.
 */
export default function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /** Whether the password meets the minimum length requirement. */
  const passwordValid = password.length >= MIN_PASSWORD_LENGTH;

  /**
   * Handles form submission.
   * Calls supabase.auth.signUp and either shows success or an error.
   */
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordValid) return;

    setIsLoading(true);
    setError(null);

    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setIsLoading(false);
    } else {
      // Supabase sends a confirmation email by default.
      // If email confirmation is disabled in Supabase dashboard, redirect directly.
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1500);
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
          Create your account
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Start controlling your features today. Free forever.
        </p>
      </div>

      {/* Success state */}
      {success ? (
        <div
          className="flex flex-col items-center text-center py-6 gap-3"
          style={{ color: "var(--status-success)" }}
        >
          <CheckCircle2 className="h-12 w-12" />
          <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
            Account created!
          </p>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Redirecting you to the dashboard…
          </p>
        </div>
      ) : (
        <form onSubmit={handleSignup} className="space-y-5">
          {/* Error message */}
          {error && <div className="alert-error">{error}</div>}

          {/* Email field */}
          <div>
            <label
              htmlFor="signup-email"
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
                id="signup-email"
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
              htmlFor="signup-password"
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
                id="signup-password"
                type={showPassword ? "text" : "password"}
                required
                minLength={MIN_PASSWORD_LENGTH}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pl-10 pr-10"
                placeholder="At least 6 characters"
              />
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

            {/* Inline password validation indicator */}
            {password.length > 0 && (
              <div className="mt-2 flex items-center gap-1.5">
                {passwordValid ? (
                  <CheckCircle2 className="h-3.5 w-3.5" style={{ color: "var(--status-success)" }} />
                ) : (
                  <XCircle className="h-3.5 w-3.5" style={{ color: "var(--status-danger)" }} />
                )}
                <span
                  className="text-xs"
                  style={{ color: passwordValid ? "var(--status-success)" : "var(--status-danger)" }}
                >
                  {passwordValid
                    ? "Password meets requirements"
                    : `Minimum ${MIN_PASSWORD_LENGTH} characters required`}
                </span>
              </div>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading || !passwordValid}
            id="signup-submit-btn"
            className="btn-primary w-full py-2.5 rounded-lg"
            style={{ fontSize: "15px" }}
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create Account"}
          </button>

          {/* ToS notice */}
          <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </p>
        </form>
      )}

      {/* Login link */}
      {!success && (
        <p className="mt-6 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold transition-colors"
            style={{ color: "var(--primary)" }}
          >
            Log in
          </Link>
        </p>
      )}
    </div>
  );
}