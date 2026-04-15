"use client";

/**
 * @file page.tsx (Landing Page — root route /)
 * @description The public-facing marketing landing page for FeatureFlow.
 * Contains:
 *  - Hero section with a 3D Three.js scene
 *  - Feature highlights section
 *  - "How it Works" steps section
 *  - Live code snippet / SDK demo section
 *  - Stats section
 *  - CTA (call-to-action) section
 *  - Footer
 *
 * Uses Suspense for the HeroScene to avoid SSR issues with Three.js.
 */

import { Suspense, lazy } from "react";
import Link from "next/link";
import {
  Zap,
  Flag,
  GitBranch,
  Clock,
  ArrowRight,
  CheckCircle2,
  Shield,
  Activity,
  Users,
  Code2,
  BarChart2,
  RotateCcw,
} from "lucide-react";
import LandingNavbar from "@/features/landing/components/LandingNavbar";

// Lazy-load Three.js scene to avoid SSR issues
const HeroScene = lazy(() => import("@/features/landing/components/HeroScene"));

// --------------------------------------------------------------------------
// Data constants
// --------------------------------------------------------------------------

const features = [
  {
    icon: Flag,
    title: "Instant Flag Toggles",
    description:
      "Enable or disable features in real-time without redeploying your application. Changes propagate to your SDK in under 500ms.",
    color: "#6366f1",
  },
  {
    icon: Users,
    title: "Precise User Targeting",
    description:
      "Target specific users or segments using any context attribute — plan type, city, user ID, or any custom property.",
    color: "#22d3ee",
  },
  {
    icon: GitBranch,
    title: "Gradual Rollouts",
    description:
      "Roll out features to 1%, 10%, or 50% of users with consistent hash-based bucketing. No surprises, no double-exposure.",
    color: "#f59e0b",
  },
  {
    icon: RotateCcw,
    title: "One-Click Rollback",
    description:
      "Something broke? Instantly revert any flag to its previous state with a full audit trail of every change ever made.",
    color: "#f43f5e",
  },
  {
    icon: Clock,
    title: "Scheduled Releases",
    description:
      "Schedule features to go live or turn off at an exact date and time. Perfect for product launches and maintenance windows.",
    color: "#a78bfa",
  },
  {
    icon: BarChart2,
    title: "Usage Analytics",
    description:
      "Track evaluation counts per project with a live usage meter. Know exactly how often your flags are evaluated month-to-month.",
    color: "#34d399",
  },
];

const steps = [
  {
    step: "01",
    title: "Create a Project",
    description: "Set up a project for each of your environments (Production, Staging, Dev). Each gets its own isolated API key.",
  },
  {
    step: "02",
    title: "Define Feature Flags",
    description:
      "Create flags with semantic names like `checkout-v2` or `dark-mode-beta`. Add targeting rules and rollout percentages.",
  },
  {
    step: "03",
    title: "Integrate the SDK",
    description:
      "Initialize with a single API call. The SDK evaluates flags in under 500ms using Redis-cached rules.",
  },
  {
    step: "04",
    title: "Ship with Confidence",
    description:
      "Toggle flags from the dashboard, monitor usage, and roll back in one click if anything goes wrong.",
  },
];

const stats = [
  { value: "< 500ms", label: "SDK Evaluation Latency" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "10M+", label: "Evaluations / Month (Free)" },
  { value: "∞", label: "Flags Per Project" },
];

const sdkSnippet = `// 1. Install the SDK
npm install featureflow-sdk

// 2. Initialize with your API key
import FeatureFlow from 'featureflow-sdk';

const ff = new FeatureFlow({ apiKey: 'ff_live_••••••••' });

// 3. Evaluate flags with user context
const flags = await ff.evaluate({
  userId: 'user_42',
  plan: 'premium',
  city: 'Mumbai'
});

// 4. Gate your feature
if (flags['new-checkout-flow']) {
  renderNewCheckout();
}`;

// --------------------------------------------------------------------------
// Section Components
// --------------------------------------------------------------------------

function HeroSection() {
  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: "var(--bg-base)" }}
      id="hero"
    >
      {/* Radial gradient background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 70% 50%, rgba(99,102,241,0.12) 0%, transparent 70%), radial-gradient(ellipse 40% 50% at 30% 60%, rgba(34,211,238,0.06) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* 3D Scene — right side */}
      <div className="absolute right-0 top-0 w-full h-full md:w-1/2 opacity-70 md:opacity-100">
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>
      </div>

      {/* Hero content — left side */}
      <div className="container-lg relative z-10 py-32">
        <div className="max-w-2xl animate-fade-in-up">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-8"
            style={{
              background: "var(--primary-muted)",
              border: "1px solid rgba(99,102,241,0.3)",
              color: "var(--primary)",
            }}
          >
            <span className="pulse-dot" />
            Real-time flag evaluation · Built for engineers
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight mb-6">
            <span style={{ color: "var(--text-primary)" }}>Ship fearlessly.</span>
            <br />
            <span className="gradient-text">Control everything.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl leading-relaxed mb-10" style={{ color: "var(--text-secondary)" }}>
            FeatureFlow gives your team real-time feature flags with millisecond-latency evaluation,
            user targeting, gradual rollouts, and one-click rollbacks — all from a single dashboard.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4">
            <Link href="/signup" className="btn-primary text-base px-6 py-3 rounded-lg">
              Get Started Free
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/dashboard" className="btn-ghost text-base px-6 py-3 rounded-lg">
              View Dashboard
            </Link>
          </div>

          {/* Trust signals */}
          <div
            className="mt-12 flex flex-wrap items-center gap-6 text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            {["No credit card required", "10M free evaluations/mo", "SDK ready in 2 minutes"].map(
              (item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" style={{ color: "var(--status-success)" }} />
                  {item}
                </span>
              )
            )}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
        <div
          className="w-6 h-10 rounded-full border-2 flex items-start justify-center p-1.5"
          style={{ borderColor: "var(--border-default)" }}
        >
          <div
            className="w-1 h-2 rounded-full animate-bounce"
            style={{ background: "var(--primary)" }}
          />
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="landing-section" id="features" style={{ background: "var(--bg-surface)" }}>
      <div className="container-lg">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div
            className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4"
            style={{ background: "var(--primary-muted)", color: "var(--primary)" }}
          >
            Everything you need
          </div>
          <h2 className="text-4xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
            Powerful primitives for <span className="gradient-text">modern teams</span>
          </h2>
          <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
            From simple on/off toggles to complex targeted rollouts — FeatureFlow handles it all
            without adding complexity to your codebase.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="card p-6 animate-fade-in-up group"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `${feature.color}20`, color: feature.color }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-base mb-2" style={{ color: "var(--text-primary)" }}>
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section className="landing-section" id="how-it-works" style={{ background: "var(--bg-base)" }}>
      <div className="container-lg">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div
            className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4"
            style={{ background: "var(--primary-muted)", color: "var(--primary)" }}
          >
            Simple integration
          </div>
          <h2 className="text-4xl font-bold" style={{ color: "var(--text-primary)" }}>
            Up and running in <span className="gradient-text">under 5 minutes</span>
          </h2>
        </div>

        <div className="relative">
          {/* Connecting line */}
          <div
            className="absolute left-1/2 top-0 bottom-0 w-px hidden lg:block"
            style={{ background: "var(--border-subtle)", transform: "translateX(-50%)" }}
            aria-hidden="true"
          />

          <div className="space-y-8">
            {steps.map((step, i) => (
              <div
                key={step.step}
                className={`flex flex-col lg:flex-row items-center gap-8 ${
                  i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                }`}
              >
                {/* Content */}
                <div className="flex-1 card p-8">
                  <div
                    className="text-5xl font-extrabold mb-3 gradient-text"
                    style={{ lineHeight: 1 }}
                  >
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                    {step.title}
                  </h3>
                  <p className="leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {step.description}
                  </p>
                </div>

                {/* Center connector dot */}
                <div
                  className="hidden lg:flex w-5 h-5 rounded-full border-2 flex-shrink-0 items-center justify-center"
                  style={{ borderColor: "var(--primary)", background: "var(--bg-base)", zIndex: 1 }}
                  aria-hidden="true"
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: "var(--primary)" }}
                  />
                </div>

                {/* Spacer */}
                <div className="flex-1 hidden lg:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SDKSection() {
  return (
    <section className="landing-section" id="docs" style={{ background: "var(--bg-surface)" }}>
      <div className="container-lg">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — text */}
          <div>
            <div
              className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4"
              style={{ background: "var(--primary-muted)", color: "var(--primary)" }}
            >
              Developer-first SDK
            </div>
            <h2 className="text-4xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>
              Integrate in <span className="gradient-text">3 lines of code</span>
            </h2>
            <p className="text-lg mb-8" style={{ color: "var(--text-secondary)" }}>
              Our SDK evaluates feature flags server-side with Redis caching for sub-500ms response
              times. Supports any user context attributes out of the box.
            </p>
            <div className="space-y-4">
              {[
                { icon: Shield, text: "Server-side evaluation — no SDK on client required" },
                { icon: Activity, text: "Redis-cached rules with real-time invalidation" },
                { icon: Code2, text: "Works with any language via REST API" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.text} className="flex items-start gap-3">
                    <Icon
                      className="h-5 w-5 mt-0.5 flex-shrink-0"
                      style={{ color: "var(--primary)" }}
                    />
                    <p style={{ color: "var(--text-secondary)" }}>{item.text}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-8">
              <Link href="/signup" className="btn-primary">
                Get Your API Key <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Right — code snippet */}
          <div>
            <div className="card overflow-hidden">
              {/* Terminal header dots */}
              <div
                className="flex items-center gap-2 px-4 py-3 border-b"
                style={{ borderColor: "var(--border-subtle)", background: "var(--bg-elevated)" }}
              >
                <div className="w-3 h-3 rounded-full" style={{ background: "#f43f5e" }} />
                <div className="w-3 h-3 rounded-full" style={{ background: "#f59e0b" }} />
                <div className="w-3 h-3 rounded-full" style={{ background: "#22d3ee" }} />
                <span
                  className="ml-2 text-xs font-mono"
                  style={{ color: "var(--text-muted)" }}
                >
                  sdk-integration.js
                </span>
              </div>
              <pre
                className="p-6 text-sm leading-relaxed overflow-x-auto"
                style={{
                  background: "var(--code-bg)",
                  color: "var(--code-text)",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {sdkSnippet}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  return (
    <section
      className="py-24"
      style={{
        background:
          "linear-gradient(135deg, var(--primary-muted) 0%, transparent 60%)",
        borderTop: "1px solid var(--border-subtle)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
      id="pricing"
    >
      <div className="container-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div
                className="text-4xl md:text-5xl font-extrabold mb-2 gradient-text"
              >
                {stat.value}
              </div>
              <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="landing-section" style={{ background: "var(--bg-base)" }}>
      <div className="container-lg text-center max-w-3xl mx-auto">
        {/* Glow effect */}
        <div
          className="absolute pointer-events-none inset-0 blur-3xl opacity-30"
          style={{
            background:
              "radial-gradient(ellipse at center, var(--primary) 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />
        <div className="relative z-10">
          <h2 className="text-5xl font-extrabold mb-6" style={{ color: "var(--text-primary)" }}>
            Ready to ship <span className="gradient-text">without fear?</span>
          </h2>
          <p className="text-xl mb-10" style={{ color: "var(--text-secondary)" }}>
            Join engineering teams using FeatureFlow to decouple deployments from releases and
            move faster without breaking things.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/signup" className="btn-primary text-base px-8 py-3.5 rounded-lg">
              Start For Free <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/login" className="btn-ghost text-base px-8 py-3.5 rounded-lg">
              Sign In
            </Link>
          </div>
          <p className="mt-6 text-sm" style={{ color: "var(--text-muted)" }}>
            Free forever with 10M evaluations per month. No credit card needed.
          </p>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer
      className="py-12 border-t"
      style={{
        background: "var(--bg-surface)",
        borderColor: "var(--border-subtle)",
      }}
    >
      <div className="container-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{ background: "var(--primary)" }}
            >
              <Zap className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
              FeatureFlow
            </span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-6 text-sm" style={{ color: "var(--text-muted)" }}>
            <a href="#features" className="hover:opacity-80 transition-opacity">Features</a>
            <a href="#docs" className="hover:opacity-80 transition-opacity">Docs</a>
            <Link href="/login" className="hover:opacity-80 transition-opacity">Sign In</Link>
            <Link href="/signup" className="hover:opacity-80 transition-opacity">Get Started</Link>
          </div>

          {/* Copyright */}
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            © {new Date().getFullYear()} FeatureFlow. Built with ♥ for developers.
          </p>
        </div>
      </div>
    </footer>
  );
}

// --------------------------------------------------------------------------
// Page Export
// --------------------------------------------------------------------------

/**
 * LandingPage — The root `/` route.
 * Renders the full public marketing page.
 */
export default function LandingPage() {
  return (
    <main>
      <LandingNavbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <SDKSection />
      <StatsSection />
      <CTASection />
      <Footer />
    </main>
  );
}