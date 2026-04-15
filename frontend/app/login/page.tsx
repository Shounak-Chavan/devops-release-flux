/**
 * @file app/login/page.tsx
 * @description The Login page for FeatureFlow.
 * Renders the LoginForm centered on a full-screen auth layout
 * with an animated background grid and brand imagery.
 */

import type { Metadata } from "next";
import LoginForm from "@/features/auth/components/LoginForm";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your FeatureFlow account to manage your feature flags.",
};

export default function LoginPage() {
  return (
    <div
      className="relative min-h-screen flex items-center justify-center px-4 py-16 overflow-hidden"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Animated background grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
          opacity: 0.4,
        }}
        aria-hidden="true"
      />

      {/* Glow blob behind the form */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none"
        style={{ background: "var(--primary-glow)", opacity: 0.15 }}
        aria-hidden="true"
      />

      {/* Login form — centered */}
      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
        <LoginForm />
      </div>
    </div>
  );
}