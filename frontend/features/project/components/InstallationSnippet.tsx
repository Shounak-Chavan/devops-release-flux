"use client";

import React, { useState } from 'react';
import { Check, Copy, Terminal, Code2, Play } from 'lucide-react';

interface InstallationSnippetProps {
  clientApiKey: string;
}

export const InstallationSnippet: React.FC<InstallationSnippetProps> = ({ clientApiKey }) => {
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  const installCommand = `npm install @featureflow/react-sdk`;
  
  const codeSnippet = `import { FeatureFlowProvider } from '@featureflow/react-sdk';

export default function RootLayout({ children }) {
  return (
    <FeatureFlowProvider 
      apiKey="${clientApiKey}"
      userContext={{ 
        userId: 'user_123',
        plan: 'premium'
      }}
    >
      {children}
    </FeatureFlowProvider>
  );
}`;

  const usageSnippet = `import { useFeatureFlag } from '@featureflow/react-sdk';

export function MyComponent() {
  const isNewCheckoutEnabled = useFeatureFlag('new-checkout-flow', false);

  return (
    <div>
      {isNewCheckoutEnabled ? <NewCheckout /> : <OldCheckout />}
    </div>
  );
}`;

  const handleCopy = (text: string, step: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(step);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      
      {/* Step 1: Install */}
      <div className="relative pl-8 before:absolute before:left-3.5 before:top-8 before:bottom-[-32px] before:w-px before:bg-[var(--border-subtle)]">
        <div className="absolute left-0 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--primary)] text-white text-xs font-bold shadow-[0_0_12px_var(--primary-glow)]">
          1
        </div>
        <h3 className="text-lg font-bold mb-3 text-[var(--text-primary)]">
          Install the Package
        </h3>
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          Add the FeatureFlow React SDK to your project dependencies.
        </p>
        
        <div className="group relative flex items-center rounded-xl p-4 font-mono text-sm border transition-colors" 
             style={{ background: "var(--code-bg)", color: "var(--code-text)", borderColor: "var(--border-subtle)" }}>
          <Terminal className="mr-3 h-4 w-4 opacity-50" />
          <code>{installCommand}</code>
          <button 
            onClick={() => handleCopy(installCommand, 1)}
            className="absolute right-4 rounded-md p-1.5 opacity-0 group-hover:opacity-100 transition-all hover:bg-white/10"
          >
            {copiedStep === 1 ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4 text-zinc-400" />}
          </button>
        </div>
      </div>

      {/* Step 2: Configure */}
      <div className="relative pl-8 before:absolute before:left-3.5 before:top-8 before:bottom-[-32px] before:w-px before:bg-[var(--border-subtle)]">
        <div className="absolute left-0 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--bg-elevated)] border-2 border-[var(--primary)] text-[var(--primary)] text-xs font-bold">
          2
        </div>
        <h3 className="text-lg font-bold mb-3 text-[var(--text-primary)]">
          Initialize the Provider
        </h3>
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          Wrap your application root with the provider. Pass in your environment's Client API Key and any context about the current user.
        </p>
        
        <div className="group relative rounded-xl border overflow-hidden" style={{ borderColor: "var(--border-subtle)" }}>
          <div className="flex items-center px-4 py-2 border-b text-xs font-mono" style={{ background: "var(--bg-elevated)", borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}>
            <Code2 className="h-3.5 w-3.5 mr-2" /> layout.tsx
          </div>
          <div className="relative p-4" style={{ background: "var(--code-bg)", color: "var(--code-text)" }}>
            <pre className="overflow-x-auto text-sm font-mono leading-relaxed">
              <code>{codeSnippet}</code>
            </pre>
            <button 
              onClick={() => handleCopy(codeSnippet, 2)}
              className="absolute top-4 right-4 rounded-md p-1.5 opacity-0 group-hover:opacity-100 transition-all hover:bg-white/10"
            >
              {copiedStep === 2 ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4 text-zinc-400" />}
            </button>
          </div>
        </div>
      </div>

      {/* Step 3: Evaluate */}
      <div className="relative pl-8">
        <div className="absolute left-0 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--bg-elevated)] border-2 border-[var(--primary)] text-[var(--primary)] text-xs font-bold">
          3
        </div>
        <h3 className="text-lg font-bold mb-3 text-[var(--text-primary)]">
          Evaluate Flags
        </h3>
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          Use the hook anywhere in your app. It evaluates instantly (0ms) using the local cache and updates automatically in real-time.
        </p>
        
        <div className="group relative rounded-xl border overflow-hidden" style={{ borderColor: "var(--border-subtle)" }}>
          <div className="flex items-center px-4 py-2 border-b text-xs font-mono" style={{ background: "var(--bg-elevated)", borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}>
            <Play className="h-3.5 w-3.5 mr-2" /> MyComponent.tsx
          </div>
          <div className="relative p-4" style={{ background: "var(--code-bg)", color: "var(--code-text)" }}>
            <pre className="overflow-x-auto text-sm font-mono leading-relaxed">
              <code>{usageSnippet}</code>
            </pre>
            <button 
              onClick={() => handleCopy(usageSnippet, 3)}
              className="absolute top-4 right-4 rounded-md p-1.5 opacity-0 group-hover:opacity-100 transition-all hover:bg-white/10"
            >
              {copiedStep === 3 ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4 text-zinc-400" />}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};