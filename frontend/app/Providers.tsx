"use client";

/**
 * @file Providers.tsx
 * @description Root provider wrapper for the entire application.
 * Wraps children with TanStack Query, Toast notifications (Sonner),
 * and initializes the theme from the persisted user preference.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { useThemeStore } from '@/store/themeStore';

/** Child component that syncs the persisted theme to the DOM on mount. */
function ThemeBootstrap() {
  const { theme } = useThemeStore();

  useEffect(() => {
    // Apply the correct CSS data-attribute so globals.css variables switch correctly
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  // Ensure a single QueryClient instance per browser session
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // Data is fresh for 1 minute
            retry: 1,
          },
        },
      })
  );


  return (
    <QueryClientProvider client={queryClient}>
      {/* Bootstrap the saved theme on mount */}
      <ThemeBootstrap />
      {children}
      {/* Global toast notifications — themed to match the design system */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--card-bg)',
            color: 'var(--text-primary)',
            border: '1px solid var(--card-border)',
            fontFamily: 'Inter, sans-serif',
          },
        }}
        richColors
      />
    </QueryClientProvider>
  );
}