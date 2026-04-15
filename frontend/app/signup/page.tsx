/**
 * @file app/signup/page.tsx
 * @description The Signup / Registration page for FeatureFlow.
 * Same auth layout pattern as Login, with a slightly different glow hue
 * to visually distinguish the two auth screens.
 */

import type { Metadata } from "next";
import SignupForm from "@/features/auth/components/SignupForm";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Sign up for FeatureFlow and start managing feature flags in minutes.",
};

export default function SignupPage() {
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

      {/* Cyan glow blob — visually distinct from the login page's indigo glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none"
        style={{ background: "rgba(34,211,238,0.15)", opacity: 0.2 }}
        aria-hidden="true"
      />

      {/* Signup form — centered */}
      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
        <SignupForm />
      </div>
    </div>
  );
}