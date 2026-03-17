"use client";

import { useAuthStore } from "../../src/store/authStore";

export default function DashboardOverview() {
  const { user } = useAuthStore();

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">Welcome to FeatureFlow!</h2>
      <p className="mt-2 text-sm text-gray-600">
        You are successfully logged in as <span className="font-medium text-gray-900">{user?.email}</span>.
      </p>
      <p className="mt-4 text-sm text-gray-600">
        Your next step is to create a Project to generate your API keys.
      </p>
    </div>
  );
}