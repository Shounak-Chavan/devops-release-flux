"use client";

import { useFeatureFlag } from "featureflow-react-sdk";

export default function Home() {
  // 🚀 Evaluate the flag in 0ms! Default is 'false'.
  const isFeatureEnabled = useFeatureFlag("test-feature", false);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-zinc-950 text-white font-sans">
      <h1 className="text-3xl font-bold mb-12 text-zinc-400">
        FeatureFlow SDK Test
      </h1>

      {/* Conditionally render based on the flag status */}
      {isFeatureEnabled ? (
        <div className="flex flex-col items-center justify-center p-12 bg-emerald-500 rounded-3xl shadow-[0_0_60px_rgba(16,185,129,0.4)] transition-all duration-500 transform scale-105">
          <span className="text-6xl mb-4">🚀</span>
          <h2 className="text-4xl font-extrabold text-white mb-2">
            The Feature is LIVE!
          </h2>
          <p className="text-emerald-100 font-medium">
            Real-time WebSockets are working perfectly.
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 bg-zinc-900 border-2 border-zinc-800 rounded-3xl transition-all duration-500">
          <span className="text-6xl mb-4 grayscale opacity-50">🚧</span>
          <h2 className="text-4xl font-bold text-zinc-500 mb-2">
            Feature is Hidden
          </h2>
          <p className="text-zinc-600">
            Go to your FeatureFlow dashboard and toggle the switch.
          </p>
        </div>
      )}
    </main>
  );
}