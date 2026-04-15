"use client";

/**
 * @file app/dashboard/projects/page.tsx
 * @description The Projects management page.
 * Lists all projects owned by the authenticated user and provides
 * a modal to create new projects. Each project card shows the API key.
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Key, Loader2, FolderKanban, X, Copy, CheckCircle2 } from "lucide-react";
import { getProjects, createProject } from "@/features/project/api/index";
import { useProjectStore } from "@/store/projectStore";
import { toast } from "sonner";

export default function ProjectsPage() {
  const queryClient = useQueryClient();
  const { setActiveProject } = useProjectStore();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");

  // Copied key tracking per project
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch all projects
  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });

  // Create project mutation
  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      // Auto-select the newly created project
      setActiveProject(newProject);
      toast.success(`Project "${newProject.name}" created and selected.`);
      setIsModalOpen(false);
      setNewProjectName("");
      setNewProjectDesc("");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create project.");
    },
  });

  /** Copies a project API key to clipboard. */
  const handleCopyKey = (projectId: string, apiKey: string) => {
    navigator.clipboard.writeText(apiKey);
    setCopiedId(projectId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    createMutation.mutate({ name: newProjectName, description: newProjectDesc });
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin" style={{ color: "var(--primary)" }} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Your Projects
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            Manage your environments and their API keys.
          </p>
        </div>
        <button
          id="create-project-btn"
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
        >
          <Plus className="h-4 w-4" /> New Project
        </button>
      </div>

      {/* Projects grid */}
      {projects?.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center"
          style={{ borderColor: "var(--border-default)" }}
        >
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl mb-4"
            style={{ background: "var(--bg-elevated)" }}
          >
            <FolderKanban className="h-7 w-7" style={{ color: "var(--text-muted)" }} />
          </div>
          <h3 className="text-base font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
            No projects yet
          </h3>
          <p className="text-sm max-w-xs" style={{ color: "var(--text-secondary)" }}>
            Create your first project to get a unique API key and start managing flags.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {projects?.map((project) => (
            <div key={project.id} className="card p-6 flex flex-col gap-4">
              {/* Project name + select button */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-base" style={{ color: "var(--text-primary)" }}>
                    {project.name}
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {project.description || "No description"}
                  </p>
                </div>
                <button
                  onClick={() => setActiveProject(project)}
                  className="text-xs font-medium px-2.5 py-1 rounded-full transition-colors"
                  style={{
                    background: "var(--primary-muted)",
                    color: "var(--primary)",
                    border: "1px solid rgba(99,102,241,0.2)",
                  }}
                >
                  Select
                </button>
              </div>

              {/* API Key display */}
              <div
                className="rounded-lg p-3"
                style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
              >
                <div
                  className="flex items-center gap-1.5 text-xs font-medium mb-1.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  <Key className="h-3 w-3" /> API Key
                </div>
                <div className="flex items-center gap-2">
                  <code
                    className="flex-1 truncate text-xs font-mono"
                    style={{ color: "var(--code-text)" }}
                  >
                    {project.api_key}
                  </code>
                  <button
                    onClick={() => handleCopyKey(project.id, project.api_key)}
                    className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded transition-colors"
                    style={{ color: copiedId === project.id ? "var(--status-success)" : "var(--text-muted)" }}
                    aria-label="Copy API key"
                  >
                    {copiedId === project.id ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Created date */}
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Created {new Date(project.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Create project modal */}
      {isModalOpen && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-project-modal-title"
        >
          <div className="modal-content">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3
                  id="create-project-modal-title"
                  className="text-lg font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Create New Project
                </h3>
                <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
                  A unique API key will be generated automatically.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label
                  htmlFor="project-name"
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Project Name *
                </label>
                <input
                  id="project-name"
                  type="text"
                  required
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="input"
                  placeholder="e.g., Production Environment"
                />
              </div>
              <div>
                <label
                  htmlFor="project-desc"
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Description{" "}
                  <span style={{ color: "var(--text-muted)" }}>(optional)</span>
                </label>
                <textarea
                  id="project-desc"
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className="input resize-none"
                  rows={3}
                  placeholder="What is this project for?"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  id="create-project-submit-btn"
                  className="btn-primary"
                >
                  {createMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}