/**
 * @file layout.tsx
 * @description The root layout for the entire FeatureFlow application.
 * Sets global metadata, injects Google Fonts via the Next.js font system,
 * and wraps all pages with the shared Providers (React Query + Toasts + Theme).
 */

import type { Metadata } from "next";
import "./globals.css";
import Providers from "./Providers";

export const metadata: Metadata = {
  title: {
    default: "FeatureFlow — Feature Flag Management",
    template: "%s | FeatureFlow",
  },
  description:
    "Ship faster and safer with real-time feature flags, gradual rollouts, and targeted releases. Built for modern engineering teams.",
  keywords: ["feature flags", "feature toggles", "A/B testing", "rollout", "devops"],
  openGraph: {
    title: "FeatureFlow — Feature Flag Management",
    description: "Ship faster and safer with real-time feature flags.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/*
       * suppressHydrationWarning is intentional here.
       * The ThemeBootstrap component adds data-theme="" to <html> on the client
       * after reading localStorage, which would otherwise cause a hydration warning.
       */}
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}