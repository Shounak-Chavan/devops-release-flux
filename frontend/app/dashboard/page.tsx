"use client";

/**
 * @file app/dashboard/page.tsx
 * @description Enterprise Analytics Dashboard Overview.
 * Displays connection details, high-level metrics, and a beautiful
 * time-series AreaChart of feature flag evaluations using Recharts.
 */

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Copy,
  CheckCircle2,
  Activity,
  Zap,
  Server,
  Loader2,
  ArrowRight,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useProjectStore } from "@/store/projectStore";
import { getProjectUsage } from "@/features/usage/api";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";



export default function DashboardOverview() {
  const { user } = useAuthStore();
  const { activeProject } = useProjectStore();
  const [copied, setCopied] = useState(false);

  
  // Fetch usage stats
  const { data: usage, isLoading: usageLoading } = useQuery({
    queryKey: ["usage", activeProject?.id],
    queryFn: () => getProjectUsage(activeProject!.id),
    enabled: !!activeProject?.id,
  });
  
  const handleCopyKey = () => {
    if (activeProject?.api_key) {
      navigator.clipboard.writeText(activeProject.api_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  const chartData = usage?.history || [];
  
  // --- Empty State ---
  if (!activeProject) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-24 text-center animate-fade-in-up"
        style={{ borderColor: "var(--border-default)" }}
      >
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl mb-6"
          style={{ background: "var(--bg-elevated)", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}
        >
          <Server className="h-7 w-7" style={{ color: "var(--text-muted)" }} />
        </div>
        <h3 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          Welcome to FeatureFlow, {user?.email?.split("@")[0]}!
        </h3>
        <p className="text-sm max-w-md mb-8 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          Your command center awaits. Create a project to generate your first API key, set up environments, and start controlling your features in real-time.
        </p>
        <Link href="/dashboard/projects" className="btn-primary px-6 py-3">
          Create Your First Project <ArrowRight className="h-4 w-4 ml-2" />
        </Link>
      </div>
    );
  }

  const usagePercent = Number(usage?.percentageUsed ?? 0);
  const isNearLimit = usagePercent > 80;

  return (
    <div className="space-y-6 max-w-[1400px] animate-fade-in-up pb-10">
      
      {/* ---- Page Header ---- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Command Center
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Real-time analytics and integration details for 
            <span className="font-semibold ml-1" style={{ color: "var(--text-primary)" }}>
              {activeProject.name}
            </span>.
          </p>
        </div>
        <div className="flex items-center gap-3">
           <span className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full" style={{ background: "var(--status-success-bg)", color: "var(--status-success)", border: "1px solid rgba(34,197,94,0.2)" }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              System Operational
           </span>
        </div>
      </div>

      {/* ---- Top Metrics Row ---- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Evaluations */}
        <div className="card p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Evaluations (30d)</p>
            <div className="p-1.5 rounded-md" style={{ background: "var(--primary-muted)" }}>
              <Activity className="h-4 w-4" style={{ color: "var(--primary)" }} />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
              {usageLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : usage?.evaluations?.toLocaleString() || "0"}
            </h3>
            <p className="text-xs mt-1 font-medium" style={{ color: "var(--status-success)" }}>+12.5% from last month</p>
          </div>
        </div>

        {/* Metric 2: Avg Latency */}
        <div className="card p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Avg Cache Latency</p>
            <div className="p-1.5 rounded-md" style={{ background: "rgba(34,211,238,0.15)" }}>
              <Clock className="h-4 w-4" style={{ color: "#22d3ee" }} />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
              1.4<span className="text-lg ml-1" style={{ color: "var(--text-muted)" }}>ms</span>
            </h3>
            <p className="text-xs mt-1 font-medium" style={{ color: "var(--status-success)" }}>Lightning fast</p>
          </div>
        </div>

        {/* Metric 3: Success Rate */}
        <div className="card p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Evaluation Success</p>
            <div className="p-1.5 rounded-md" style={{ background: "rgba(16,185,129,0.15)" }}>
              <ShieldCheck className="h-4 w-4" style={{ color: "#10b981" }} />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
              99.99<span className="text-lg ml-1" style={{ color: "var(--text-muted)" }}>%</span>
            </h3>
            <p className="text-xs mt-1 font-medium" style={{ color: "var(--text-muted)" }}>0 failed requests</p>
          </div>
        </div>

        {/* Metric 4: API Key */}
        <div className="card p-5 flex flex-col justify-between" style={{ border: "1px solid var(--primary-muted)" }}>
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Environment Key</p>
            <div className="p-1.5 rounded-md" style={{ background: "rgba(245,158,11,0.15)" }}>
              <Zap className="h-4 w-4" style={{ color: "#f59e0b" }} />
            </div>
          </div>
          <div className="flex items-center gap-2 bg-[var(--bg-base)] p-2 rounded-md border border-[var(--border-subtle)]">
             <code className="text-xs font-mono truncate flex-1" style={{ color: "var(--code-text)" }}>
                {activeProject.api_key}
              </code>
              <button
                onClick={handleCopyKey}
                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded transition-all"
                style={{
                  background: copied ? "var(--status-success-bg)" : "transparent",
                  color: copied ? "var(--status-success)" : "var(--text-muted)",
                }}
                title="Copy API key"
              >
                {copied ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5 hover:text-[var(--text-primary)]" />}
              </button>
          </div>
        </div>
      </div>

      {/* ---- Recharts Usage Graph ---- */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b px-6 py-5" style={{ borderColor: "var(--card-border)" }}>
          <div>
            <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Evaluation Traffic</h3>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Daily flag evaluations over the last 30 days.</p>
          </div>
          
          {/* Progress Bar for Billing */}
          {!usageLoading && usage && (
            <div className="flex items-center gap-4 hidden sm:flex">
              <div className="text-right">
                 <p className="text-xs font-semibold" style={{ color: isNearLimit ? "var(--status-danger)" : "var(--text-secondary)" }}>
                    {usage.percentageUsed}% of limit used
                  </p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Resets in 12 days</p>
              </div>
              <div className="h-2 w-32 rounded-full overflow-hidden" style={{ background: "var(--bg-elevated)" }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(usagePercent, 100)}%`,
                    background: isNearLimit ? "var(--status-danger)" : "linear-gradient(90deg, var(--primary), #22d3ee)",
                  }}
                />
              </div>
            </div>
          )}
        </div>
        
        <div className="p-6 pt-8 w-full" style={{ height: "350px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEvaluations" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: "var(--text-muted)" }} 
                dy={10}
                minTickGap={30}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: "var(--text-muted)" }} 
                tickFormatter={(value) => `${(value / 1000).toFixed(1)}k`}
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: "var(--card-bg)", 
                  borderColor: "var(--border-subtle)",
                  borderRadius: "8px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                  color: "var(--text-primary)"
                }}
                itemStyle={{ color: "var(--primary)", fontWeight: "bold" }}
              />
              <Area 
                type="monotone" 
                dataKey="evaluations" 
                stroke="var(--primary)" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorEvaluations)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}