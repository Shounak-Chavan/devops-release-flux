"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Flag, Loader2, Plus } from "lucide-react";
import { useProjectStore } from "@/store/projectStore";
import { getFlagsByProject, createFlag, toggleFlag } from "@/features/flags/api";
import Link from "next/link";

export default function FlagsPage() {
  const queryClient = useQueryClient();
  const { activeProject } = useProjectStore();
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFlagName, setNewFlagName] = useState("");
  const [newFlagDesc, setNewFlagDesc] = useState("");

  // Fetch Flags
  const { data: flags, isLoading } = useQuery({
    queryKey: ["flags", activeProject?.id],
    queryFn: () => getFlagsByProject(activeProject!.id),
    enabled: !!activeProject?.id,
  });

  // Create Flag Mutation
  const createMutation = useMutation({
    mutationFn: (data: { projectId: string; name: string; description?: string }) => createFlag(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flags", activeProject?.id] });
      setIsModalOpen(false);
      setNewFlagName("");
      setNewFlagDesc("");
    },
  });

  // Toggle Flag Mutation
  const toggleMutation = useMutation({
    mutationFn: toggleFlag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flags", activeProject?.id] });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFlagName.trim() || !activeProject) return;
    
    // We enforce lowercase and hyphens for flag names (e.g., "new-checkout")
    const formattedName = newFlagName.trim().toLowerCase().replace(/\s+/g, '-');
    
    createMutation.mutate({ 
      projectId: activeProject.id, 
      name: formattedName, 
      description: newFlagDesc 
    });
  };

  if (!activeProject) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white text-center">
        <h3 className="text-lg font-medium text-gray-900">No Project Selected</h3>
        <p className="mt-1 text-sm text-gray-500">Please select or create a project from the header to view flags.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Feature Flags</h2>
          <p className="text-sm text-gray-500">Managing flags for <span className="font-semibold text-gray-700">{activeProject.name}</span></p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" /> Create Flag
        </button>
      </div>

      {flags?.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-12 text-center">
          <Flag className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-sm font-medium text-gray-900">No flags in this project</h3>
          <p className="mt-1 text-sm text-gray-500">Create your first feature flag to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {flags?.map((flag) => (
            <div key={flag.id} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div>
                <Link href={`/dashboard/flags/${flag.id}`} className="text-base font-semibold text-blue-600 hover:underline font-mono">
                  {flag.name}
                </Link>
                <p className="text-sm text-gray-500">{flag.description || "No description"}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${flag.status ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {flag.status ? 'ON' : 'OFF'}
                </span>
                
                {/* Tailwind Toggle Switch */}
                <button
                  onClick={() => toggleMutation.mutate(flag.id)}
                  disabled={toggleMutation.isPending}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50 ${
                    flag.status ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      flag.status ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Feature Flag</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Flag Key (Name)</label>
                <input
                  type="text"
                  required
                  value={newFlagName}
                  onChange={(e) => setNewFlagName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-mono"
                  placeholder="e.g., new-checkout-flow"
                />
                <p className="mt-1 text-xs text-gray-500">Keys will be automatically formatted to lowercase with hyphens.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea
                  value={newFlagDesc}
                  onChange={(e) => setNewFlagDesc(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                  rows={3}
                  placeholder="What does this feature do?"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400"
                >
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Create Flag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}