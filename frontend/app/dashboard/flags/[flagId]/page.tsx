"use client";

/**
 * @file app/dashboard/flags/[flagId]/page.tsx
 * @description The Flag Detail page.
 * Displays a single feature flag's targeting rules, allows adding/removing rules,
 * and shows the full audit history timeline with a one-click rollback action.
 */

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Loader2,
  History,
  RotateCcw,
  GitCommit,
  X,
  Clock,
  AlertTriangle,
} from "lucide-react";
import {
  getFlagById,
  addTargetingRule,
  removeTargetingRule,
  getFlagAuditLogs,
  rollbackFlag,
  scheduleFlag,
  deleteFlag,
} from "@/features/flags/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function FlagDetailsPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const router = useRouter();
  const flagId = params.flagId as string;

  // Targeting rule form state
  const [attribute, setAttribute] = useState("city");
  const [operator, setOperator] = useState("EQUALS");
  const [value, setValue] = useState("");
  const [percentage, setPercentage] = useState(100);

  // Schedule form state
  const [scheduleStatus, setScheduleStatus] = useState(true);
  const [scheduleTime, setScheduleTime] = useState("");

  // --- Queries ---

  const { data: flag, isLoading } = useQuery({
    queryKey: ["flag", flagId],
    queryFn: () => getFlagById(flagId),
  });

  const { data: logs } = useQuery({
    queryKey: ["flag-logs", flagId],
    queryFn: () => getFlagAuditLogs(flagId),
  });

  // --- Mutations ---

  const addRuleMutation = useMutation({
    mutationFn: addTargetingRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flag", flagId] });
      toast.success("Targeting rule added.");
      setValue("");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to add rule."),
  });

  const removeRuleMutation = useMutation({
    mutationFn: removeTargetingRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flag", flagId] });
      toast.success("Targeting rule removed.");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to remove rule."),
  });

  const rollbackMutation = useMutation({
    mutationFn: rollbackFlag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flag", flagId] });
      queryClient.invalidateQueries({ queryKey: ["flag-logs", flagId] });
      queryClient.invalidateQueries({ queryKey: ["flags"] });
      toast.success("Rollback performed successfully.");
    },
    onError: (err: Error) => toast.error(err.message || "Rollback failed."),
  });

  const scheduleMutation = useMutation({
    mutationFn: scheduleFlag,
    onSuccess: (data) => {
      toast.success(data.message || "Flag toggle scheduled.");
      setScheduleTime("");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to schedule toggle."),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFlag,
    onSuccess: () => {
      toast.success("Flag deleted.");
      router.push("/dashboard/flags");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to delete flag."),
  });

  /** Submits the add-rule form. */
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

  /** Confirms and triggers a rollback mutation. */
  const handleRollback = () => {
    if (confirm("Roll back this flag to its previous state?")) {
      rollbackMutation.mutate(flagId);
    }
  };

  /** Submits the schedule form. */
  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleTime) return;
    scheduleMutation.mutate({
      flagId,
      targetStatus: scheduleStatus,
      scheduledTime: new Date(scheduleTime).toISOString(),
    });
  };

  /** Confirms and deletes the flag. */
  const handleDelete = () => {
    if (confirm(`Permanently delete flag "${flag?.name}"? This cannot be undone.`)) {
      deleteMutation.mutate(flagId);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin" style={{ color: "var(--primary)" }} />
      </div>
    );
  }

  // Not found
  if (!flag) {
    return (
      <div className="text-center py-16" style={{ color: "var(--text-secondary)" }}>
        Flag not found.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in-up">
      {/* ---- Header ---- */}
      <div>
        <Link
          href="/dashboard/flags"
          className="inline-flex items-center gap-1.5 text-sm mb-4 transition-colors"
          style={{ color: "var(--text-secondary)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--primary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
        >
          <ArrowLeft className="h-4 w-4" /> Back to Flags
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              className="text-2xl font-bold font-mono"
              style={{ color: "var(--text-primary)" }}
            >
              {flag.name}
            </h2>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              {flag.description || "No description provided."}
            </p>
          </div>
          <span className={flag.status ? "badge-on" : "badge-off"}>
            Base: {flag.status ? "ON" : "OFF"}
          </span>
        </div>
      </div>

      {/* ---- Targeting Rules Card ---- */}
      <div className="card overflow-hidden">
        {/* Section header */}
        <div
          className="flex items-center gap-2.5 border-b px-6 py-4"
          style={{ borderColor: "var(--card-border)" }}
        >
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{ background: "var(--primary-muted)", color: "var(--primary)" }}
          >
            <GitCommit className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Targeting Rules
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              Serve this feature only to users matching specific criteria.
            </p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Add Rule Form */}
          <form
            onSubmit={handleAddRule}
            className="grid grid-cols-1 sm:grid-cols-[1fr_140px_1fr_100px_auto] gap-3 items-end rounded-xl p-4"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
          >
            {/* Attribute */}
            <div>
              <label
                htmlFor="rule-attribute"
                className="block text-xs font-medium mb-1"
                style={{ color: "var(--text-muted)" }}
              >
                Attribute
              </label>
              <input
                id="rule-attribute"
                type="text"
                value={attribute}
                onChange={(e) => setAttribute(e.target.value)}
                className="input text-sm"
                placeholder="e.g., plan"
                required
              />
            </div>

            {/* Operator */}
            <div>
              <label
                htmlFor="rule-operator"
                className="block text-xs font-medium mb-1"
                style={{ color: "var(--text-muted)" }}
              >
                Operator
              </label>
              <select
                id="rule-operator"
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                className="input text-sm"
                style={{ cursor: "pointer" }}
              >
              <option value="EQUALS">EQUALS</option>
                <option value="NOT_EQUALS">NOT EQUALS</option>
                <option value="CONTAINS">CONTAINS</option>
                <option value="GREATER_THAN">GREATER THAN</option>
                <option value="LESS_THAN">LESS THAN</option>
                <option value="IN">IN (comma-separated)</option>
              </select>
            </div>

            {/* Value */}
            <div>
              <label
                htmlFor="rule-value"
                className="block text-xs font-medium mb-1"
                style={{ color: "var(--text-muted)" }}
              >
                Value
              </label>
              <input
                id="rule-value"
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="input text-sm"
                placeholder="e.g., premium"
                required
              />
            </div>

            {/* Rollout % */}
            <div>
              <label
                htmlFor="rule-rollout"
                className="block text-xs font-medium mb-1"
                style={{ color: "var(--text-muted)" }}
              >
                Rollout %
              </label>
              <input
                id="rule-rollout"
                type="number"
                min={0}
                max={100}
                value={percentage}
                onChange={(e) => setPercentage(Number(e.target.value))}
                className="input text-sm"
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={addRuleMutation.isPending}
              id="add-rule-btn"
              className="btn-primary h-10 px-4"
            >
              {addRuleMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </button>
          </form>

          {/* Active Rules List */}
          <div className="space-y-2">
            {flag.targeting_rules?.length === 0 ? (
              <p className="text-sm text-center py-6" style={{ color: "var(--text-muted)" }}>
                No targeting rules applied. Flag evaluates using its base status only.
              </p>
            ) : (
              flag.targeting_rules?.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between rounded-lg p-3.5"
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div
                    className="flex items-center gap-2 text-sm flex-wrap"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <span style={{ color: "var(--text-muted)" }}>If</span>
                    <span
                      className="font-mono font-semibold px-2 py-0.5 rounded text-xs"
                      style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}
                    >
                      {rule.attribute}
                    </span>
                    <span className="text-xs font-semibold uppercase" style={{ color: "var(--text-muted)" }}>
                      {rule.operator}
                    </span>
                    <span
                      className="font-semibold px-2 py-0.5 rounded text-xs"
                      style={{
                        background: "var(--primary-muted)",
                        color: "var(--primary)",
                        border: "1px solid rgba(99,102,241,0.2)",
                      }}
                    >
                      {rule.value}
                    </span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>→ serve to</span>
                    <span className="font-bold text-xs" style={{ color: "var(--status-success)" }}>
                      {rule.rollout_percentage}%
                    </span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>of users</span>
                  </div>

                  <button
                    onClick={() => removeRuleMutation.mutate({ flagId, ruleId: rule.id })}
                    disabled={removeRuleMutation.isPending}
                    className="flex h-7 w-7 items-center justify-center rounded-md transition-colors ml-3 flex-shrink-0"
                    style={{ color: "var(--text-muted)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--status-danger)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                    aria-label={`Remove rule for ${rule.attribute} ${rule.operator} ${rule.value}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ---- Schedule Toggle Card ---- */}
      <div className="card overflow-hidden">
        <div
          className="flex items-center gap-2.5 border-b px-6 py-4"
          style={{ borderColor: "var(--card-border)" }}
        >
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{ background: "rgba(167,139,250,0.15)", color: "#a78bfa" }}
          >
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Schedule Toggle
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              Automatically turn this flag ON or OFF at a future date and time.
            </p>
          </div>
        </div>

        <div className="p-6">
          <form
            onSubmit={handleSchedule}
            className="grid grid-cols-1 sm:grid-cols-[1fr_160px_auto] gap-3 items-end"
          >
            {/* Date-time picker */}
            <div>
              <label
                htmlFor="schedule-time"
                className="block text-xs font-medium mb-1"
                style={{ color: "var(--text-muted)" }}
              >
                Schedule Date &amp; Time
              </label>
              <input
                id="schedule-time"
                type="datetime-local"
                required
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="input text-sm"
                min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
              />
            </div>

            {/* Target status */}
            <div>
              <label
                htmlFor="schedule-status"
                className="block text-xs font-medium mb-1"
                style={{ color: "var(--text-muted)" }}
              >
                Set flag to
              </label>
              <select
                id="schedule-status"
                value={scheduleStatus ? "true" : "false"}
                onChange={(e) => setScheduleStatus(e.target.value === "true")}
                className="input text-sm"
                style={{ cursor: "pointer" }}
              >
                <option value="true">ON</option>
                <option value="false">OFF</option>
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={scheduleMutation.isPending || !scheduleTime}
              className="btn-primary h-10 px-4"
            >
              {scheduleMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
              Schedule
            </button>
          </form>
        </div>
      </div>

      {/* ---- Audit Log Card ---- */}
      <div className="card overflow-hidden">
        {/* Section header */}
        <div
          className="flex items-center justify-between border-b px-6 py-4"
          style={{ borderColor: "var(--card-border)" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b" }}
            >
              <History className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Audit History
              </h3>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                Every change made to this flag.
              </p>
            </div>
          </div>

          {/* Rollback button */}
          <button
            onClick={handleRollback}
            disabled={rollbackMutation.isPending || !logs || logs.length === 0}
            id="rollback-btn"
            className="btn-ghost text-sm py-1.5 px-3"
          >
            {rollbackMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4" />
            )}
            Rollback
          </button>
        </div>

        <div className="p-6">
          {!logs || logs.length === 0 ? (
            <p className="text-sm text-center py-6" style={{ color: "var(--text-muted)" }}>
              No history recorded yet for this flag.
            </p>
          ) : (
            <div
              className="relative space-y-6 border-l-2 ml-3 pl-6"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              {logs.map((log) => (
                <div key={log.id} className="relative">
                  {/* Timeline dot */}
                  <div
                    className="absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2"
                    style={{
                      background: "var(--primary)",
                      borderColor: "var(--bg-base)",
                      boxShadow: "0 0 6px var(--primary-glow)",
                    }}
                    aria-hidden="true"
                  />

                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      {/* Action badge */}
                      <span
                        className="inline-block rounded-md px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide"
                        style={{
                          background: "var(--bg-elevated)",
                          color: "var(--text-secondary)",
                          border: "1px solid var(--border-subtle)",
                        }}
                      >
                        {log.action.replace("_", " ")}
                      </span>

                      {/* Who */}
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        Performed by{" "}
                        <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                          {log.users?.email || "System"}
                        </span>
                      </p>

                      {/* State change */}
                      {log.previous_state && log.new_state && (
                        <div
                          className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs"
                          style={{
                            background: "var(--bg-elevated)",
                            border: "1px solid var(--border-subtle)",
                          }}
                        >
                          <span
                            className="font-semibold"
                            style={{
                              color: log.previous_state.status
                                ? "var(--status-success)"
                                : "var(--text-muted)",
                            }}
                          >
                            {log.previous_state.status ? "ON" : "OFF"}
                          </span>
                          <span style={{ color: "var(--text-muted)" }}>→</span>
                          <span
                            className="font-semibold"
                            style={{
                              color: log.new_state.status
                                ? "var(--status-success)"
                                : "var(--text-muted)",
                            }}
                          >
                            {log.new_state.status ? "ON" : "OFF"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Timestamp */}
                    <span className="text-xs flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* ---- Danger Zone ---- */}
      <section
        className="rounded-2xl overflow-hidden"
        style={{
          border: "1px solid var(--status-danger)",
          background: "var(--status-danger-bg)",
        }}
      >
        <div
          className="flex items-center gap-2.5 border-b px-6 py-4"
          style={{ borderColor: "rgba(244,63,94,0.2)" }}
        >
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{ background: "var(--status-danger-bg)", color: "var(--status-danger)" }}
          >
            <AlertTriangle className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-semibold" style={{ color: "var(--status-danger)" }}>
            Danger Zone
          </h3>
        </div>
        <div className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Delete this flag
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
              Permanently removes the flag, all targeting rules, and audit history.
            </p>
          </div>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="btn-danger"
          >
            {deleteMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Delete Flag
          </button>
        </div>
      </section>
    </div>
  );
}
