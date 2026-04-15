"use client";

/**
 * @file app/dashboard/flags/page.tsx
 * @description The Feature Flags list page.
 * Displays all flags for the active project using an Enterprise Data Table.
 * Supports global text filtering, column sorting, inline toggling, and flag creation.
 */

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  useReactTable, 
  getCoreRowModel, 
  getSortedRowModel, 
  getFilteredRowModel, 
  flexRender,
  SortingState
} from "@tanstack/react-table";
import { Flag, Loader2, Plus, X, Search, ArrowRight, ArrowUpDown } from "lucide-react";
import { useProjectStore } from "@/store/projectStore";
import { getFlagsByProject, createFlag, toggleFlag } from "@/features/flags/api";
import Link from "next/link";
import { toast } from "sonner";

export default function FlagsPage() {
  const queryClient = useQueryClient();
  const { activeProject } = useProjectStore();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFlagName, setNewFlagName] = useState("");
  const [newFlagDesc, setNewFlagDesc] = useState("");
  
  // Table State
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // Fetch Flags
  const { data: flags, isLoading } = useQuery({
    queryKey: ["flags", activeProject?.id],
    queryFn: () => getFlagsByProject(activeProject!.id),
    enabled: !!activeProject?.id,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: { projectId: string; name: string; description?: string }) =>
      createFlag(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flags", activeProject?.id] });
      toast.success("Feature flag created successfully.");
      setIsModalOpen(false);
      setNewFlagName("");
      setNewFlagDesc("");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to create flag."),
  });

  const toggleMutation = useMutation({
    mutationFn: toggleFlag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flags", activeProject?.id] });
      toast.success("Flag status updated.");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to toggle flag."),
  });

  // Handle Create Submit
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFlagName.trim() || !activeProject) return;
    const formattedName = newFlagName.trim().toLowerCase().replace(/\s+/g, "-");
    createMutation.mutate({
      projectId: activeProject.id,
      name: formattedName,
      description: newFlagDesc,
    });
  };

  // Define Table Columns
  const columns = useMemo(() => [
    {
      accessorKey: "name",
      header: ({ column }: any) => (
        <button 
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} 
          className="flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors uppercase tracking-wider"
        >
          Flag Key <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />
        </button>
      ),
      cell: ({ row }: any) => (
        <div>
          <Link 
            href={`/dashboard/flags/${row.original.id}`} 
            className="font-mono text-sm font-semibold hover:underline block" 
            style={{ color: "var(--primary)" }}
          >
            {row.original.name}
          </Link>
          <p className="text-xs mt-1 truncate max-w-[280px]" style={{ color: "var(--text-muted)" }}>
            {row.original.description || "No description provided"}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => (
        <span className={row.original.status ? "badge-on" : "badge-off"}>
          {row.original.status ? "ON" : "OFF"}
        </span>
      ),
    },
    {
      id: "toggle",
      header: "Quick Toggle",
      cell: ({ row }: any) => (
        <button
          onClick={() => toggleMutation.mutate(row.original.id)}
          disabled={toggleMutation.isPending}
          className={`toggle-track ${row.original.status ? "on" : "off"} disabled:opacity-50`}
          role="switch"
          aria-checked={row.original.status}
          aria-label={`Toggle ${row.original.name}`}
        >
          <div className="toggle-thumb" />
        </button>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }: any) => (
        <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {new Date(row.original.created_at).toLocaleDateString(undefined, { 
            year: 'numeric', month: 'short', day: 'numeric' 
          })}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }: any) => (
        <div className="flex justify-end">
          <Link
            href={`/dashboard/flags/${row.original.id}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-all"
            style={{ background: "var(--bg-base)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--primary)";
              e.currentTarget.style.borderColor = "var(--primary-muted)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-secondary)";
              e.currentTarget.style.borderColor = "var(--border-subtle)";
            }}
            aria-label={`View details for ${row.original.name}`}
          >
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ),
    }
  ], [toggleMutation]);

  // Initialize React Table
  const table = useReactTable({
    data: flags || [],
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // Empty State: No Project
  if (!activeProject) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed text-center" style={{ borderColor: "var(--border-default)" }}>
        <Flag className="h-10 w-10 mb-3" style={{ color: "var(--text-muted)" }} />
        <h3 className="text-base font-semibold mb-1" style={{ color: "var(--text-primary)" }}>No project selected</h3>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Select or create a project to manage its flags.</p>
      </div>
    );
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin" style={{ color: "var(--primary)" }} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>Feature Flags</h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Managing flags for <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{activeProject.name}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--text-muted)" }} />
            <input
              type="text"
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="    Search flags..."
              className="input pl-9 w-full text-sm"
            />
          </div>
          {/* Create Button */}
          <button onClick={() => setIsModalOpen(true)} className="btn-primary h-10 px-4 whitespace-nowrap">
            <Plus className="h-4 w-4 mr-1" /> Create Flag
          </button>
        </div>
      </div>

      {/* Enterprise Data Table */}
      <div className="card overflow-hidden" style={{ border: "1px solid var(--card-border)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b" style={{ borderColor: "var(--border-subtle)", background: "var(--bg-elevated)" }}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Flag className="h-8 w-8 mb-3" style={{ color: "var(--border-default)" }} />
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>No flags found</p>
                      <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Create a new flag or adjust your search.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b transition-colors" style={{ borderColor: "var(--border-subtle)", background: "var(--card-bg)" }}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Flag Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="create-flag-modal-title">
          <div className="modal-content">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 id="create-flag-modal-title" className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                  Create Feature Flag
                </h3>
                <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
                  A flag key must be lowercase, hyphenated.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label htmlFor="flag-name" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                  Flag Key (Name) *
                </label>
                <input
                  id="flag-name"
                  type="text"
                  required
                  value={newFlagName}
                  onChange={(e) => setNewFlagName(e.target.value)}
                  className="input font-mono"
                  placeholder="e.g., new-checkout-flow"
                />
                <p className="mt-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                  Will be auto-formatted to lowercase with hyphens.
                </p>
              </div>

              <div>
                <label htmlFor="flag-description" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                  Description <span style={{ color: "var(--text-muted)" }}>(optional)</span>
                </label>
                <textarea
                  id="flag-description"
                  value={newFlagDesc}
                  onChange={(e) => setNewFlagDesc(e.target.value)}
                  className="input resize-none"
                  rows={3}
                  placeholder="What does this feature do?"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-ghost">
                  Cancel
                </button>
                <button type="submit" disabled={createMutation.isPending} id="create-flag-submit-btn" className="btn-primary">
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
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