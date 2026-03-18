"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Copy, CheckCircle2, Activity, Zap, Server, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useProjectStore } from "@/store/projectStore";
import { getProjectUsage } from "@/features/usage/api";
import Link from "next/link";

export default function DashboardOverview() {
  const { user } = useAuthStore();
  const { activeProject } = useProjectStore();
  const [copied, setCopied] = useState(false);

  // Fetch Usage Stats (refetches every time activeProject changes)
  const { data: usage, isLoading: usageLoading } = useQuery({
    queryKey: ["usage", activeProject?.id],
    queryFn: () => getProjectUsage(activeProject!.id),
    enabled: !!activeProject?.id,
    refetchInterval: 30000, // Auto-refresh usage every 30 seconds
  });

  const handleCopyKey = () => {
    if (activeProject?.api_key) {
      navigator.clipboard.writeText(activeProject.api_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
        <Server className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">Welcome to FeatureFlow, {user?.email?.split('@')[0]}!</h3>
        <p className="mt-2 text-sm text-gray-500 max-w-sm">
          To get started, create a new project. A project represents an environment (like Staging or Production) and holds its own flags and API keys.
        </p>
        <Link 
          href="/dashboard/projects"
          className="mt-6 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Go to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Project Overview</h2>
        <p className="text-sm text-gray-500 mt-1">Metrics and connection details for <span className="font-semibold text-gray-700">{activeProject.name}</span></p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* API Key Connection Card */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" /> Connection Details
            </h3>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-center">
            <p className="text-sm text-gray-600 mb-4">
              Use this Environment API Key to initialize the FeatureFlow SDK in your application. <strong>Keep this key secure.</strong>
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 block truncate rounded-lg bg-gray-100 p-3 text-sm font-mono text-gray-800 border border-gray-200">
                {activeProject.api_key}
              </code>
              <button
                onClick={handleCopyKey}
                className="flex items-center justify-center rounded-lg bg-blue-50 p-3 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200"
                title="Copy to clipboard"
              >
                {copied ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Usage Statistics Card */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" /> Current Month Usage
            </h3>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-center">
            {usageLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : !usage ? (
              <p className="text-sm text-gray-500">Usage data unavailable.</p>
            ) : (
              <>
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <span className="text-3xl font-bold text-gray-900">{usage.evaluations.toLocaleString()}</span>
                    <span className="text-sm text-gray-500 ml-2">evaluations</span>
                  </div>
                  <div className="text-sm font-medium text-gray-600">
                    Limit: {usage.limit.toLocaleString()}
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden mt-4">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${Number(usage.percentageUsed) > 90 ? 'bg-red-500' : 'bg-blue-500'}`}
                    style={{ width: `${Math.min(Number(usage.percentageUsed), 100)}%` }}
                  ></div>
                </div>
                
                <div className="mt-3 flex justify-between items-center text-xs text-gray-500">
                  <span>Billing Period: {usage.month}</span>
                  <span className="font-medium">{usage.percentageUsed}% Used</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}