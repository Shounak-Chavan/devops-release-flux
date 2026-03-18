"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Loader2, GitCommit, History, RotateCcw } from "lucide-react";
import { getFlagById, addTargetingRule, removeTargetingRule, getFlagAuditLogs, rollbackFlag } from "@/features/flags/api";

export default function FlagDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const flagId = params.flagId as string;

  const [attribute, setAttribute] = useState("city");
  const [operator, setOperator] = useState("EQUALS");
  const [value, setValue] = useState("");
  const [percentage, setPercentage] = useState(100);

  // Fetch Flag Details
  const { data: flag, isLoading } = useQuery({
    queryKey: ["flag", flagId],
    queryFn: () => getFlagById(flagId),
  });

  // Add Rule Mutation
  const addRuleMutation = useMutation({
    mutationFn: addTargetingRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flag", flagId] });
      setValue(""); // Reset input
    },
  });

  // Remove Rule Mutation
  const removeRuleMutation = useMutation({
    mutationFn: removeTargetingRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flag", flagId] });
    },
  });

  // Fetch Audit Logs
  const { data: logs } = useQuery({
    queryKey: ["flag-logs", flagId],
    queryFn: () => getFlagAuditLogs(flagId),
  });

  // Rollback Mutation
  const rollbackMutation = useMutation({
    mutationFn: rollbackFlag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flag", flagId] });
      queryClient.invalidateQueries({ queryKey: ["flag-logs", flagId] });
      queryClient.invalidateQueries({ queryKey: ["flags"] }); // Refresh the main list too
    },
  });

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    addRuleMutation.mutate({
      flagId,
      attribute,
      operator,
      value: value.trim(),
      rolloutPercentage: Number(percentage),
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!flag) {
    return <div>Flag not found.</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <Link href="/dashboard/flags" className="flex items-center text-sm text-gray-500 hover:text-blue-600 mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Flags
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 font-mono">{flag.name}</h2>
            <p className="text-sm text-gray-500 mt-1">{flag.description || "No description provided."}</p>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${flag.status ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
            Base Status: {flag.status ? 'ON' : 'OFF'}
          </span>
        </div>
      </div>

      {/* Targeting Rules Section */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <GitCommit className="h-5 w-5 text-blue-600" /> Targeting Rules
          </h3>
          <p className="text-sm text-gray-500 mt-1">Serve this feature only to users who match specific criteria.</p>
        </div>

        <div className="p-6">
          {/* Add Rule Form */}
          <form onSubmit={handleAddRule} className="flex flex-wrap items-end gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 mb-6">
            <div className="flex-1 min-w-[120px]">
              <label className="block text-xs font-medium text-gray-700 mb-1">User Attribute</label>
              <input type="text" value={attribute} onChange={(e) => setAttribute(e.target.value)} className="w-full rounded-md border border-gray-300 p-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="e.g., plan" required />
            </div>
            
            <div className="w-32">
              <label className="block text-xs font-medium text-gray-700 mb-1">Operator</label>
              <select value={operator} onChange={(e) => setOperator(e.target.value)} className="w-full rounded-md border border-gray-300 p-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white">
                <option value="EQUALS">EQUALS</option>
                <option value="CONTAINS">CONTAINS</option>
              </select>
            </div>

            <div className="flex-1 min-w-[120px]">
              <label className="block text-xs font-medium text-gray-700 mb-1">Value</label>
              <input type="text" value={value} onChange={(e) => setValue(e.target.value)} className="w-full rounded-md border border-gray-300 p-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="e.g., premium" required />
            </div>

            <div className="w-24">
              <label className="block text-xs font-medium text-gray-700 mb-1">Rollout %</label>
              <input type="number" min="0" max="100" value={percentage} onChange={(e) => setPercentage(Number(e.target.value))} className="w-full rounded-md border border-gray-300 p-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" required />
            </div>

            <button type="submit" disabled={addRuleMutation.isPending} className="flex h-[38px] items-center rounded-md bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {addRuleMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            </button>
          </form>

          {/* Active Rules List */}
          <div className="space-y-3">
            {flag.targeting_rules?.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No targeting rules applied. Flag will evaluate using the Base Status.</p>
            ) : (
              flag.targeting_rules?.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between rounded-md border border-gray-200 p-3 bg-white">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    If <span className="font-semibold px-2 py-0.5 bg-gray-100 rounded text-gray-900">{rule.attribute}</span> 
                    <span className="text-gray-500 text-xs">{rule.operator}</span> 
                    <span className="font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-100">{rule.value}</span>
                    <span className="text-gray-400">→</span>
                    Serve to <span className="font-semibold text-green-600">{rule.rollout_percentage}%</span> of users
                  </div>
                  <button 
                    onClick={() => removeRuleMutation.mutate({ flagId, ruleId: rule.id })}
                    disabled={removeRuleMutation.isPending}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>

            {/* ... existing Targeting Rules section ... */}

      {/* Audit Log & History Section */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden mt-8">
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <History className="h-5 w-5 text-blue-600" /> Audit History
            </h3>
            <p className="text-sm text-gray-500 mt-1">A complete log of all changes made to this flag.</p>
          </div>
          
          <button 
            onClick={() => {
              if (confirm("Are you sure you want to rollback to the previous state?")) {
                rollbackMutation.mutate(flagId);
              }
            }}
            disabled={rollbackMutation.isPending || !logs || logs.length === 0}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {rollbackMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
            One-Click Rollback
          </button>
        </div>

        <div className="p-6">
          {!logs || logs.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No history recorded yet.</p>
          ) : (
            <div className="space-y-6 border-l-2 border-gray-100 ml-3 pl-6 relative">
              {logs.map((log, index) => (
                <div key={log.id} className="relative">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-white bg-blue-500 shadow-sm"></div>
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 mb-1">
                        {log.action.replace('_', ' ')}
                      </span>
                      <p className="text-sm text-gray-600">
                        Performed by <span className="font-medium text-gray-900">{log.users?.email || 'System'}</span>
                      </p>
                      
                      {/* Show state changes if available */}
                      {log.previous_state && log.new_state && (
                        <div className="mt-2 text-xs text-gray-500 flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-100 inline-flex">
                          Status: 
                          <span className={`font-semibold ${log.previous_state.status ? 'text-green-600' : 'text-gray-500'}`}>
                            {log.previous_state.status ? 'ON' : 'OFF'}
                          </span>
                          <span>→</span>
                          <span className={`font-semibold ${log.new_state.status ? 'text-green-600' : 'text-gray-500'}`}>
                            {log.new_state.status ? 'ON' : 'OFF'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

        </div>


      </div>
    </div>
  );
}