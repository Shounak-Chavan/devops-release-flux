import type { Metadata } from "next";
import "./globals.css";
import Providers from "./Providers"; 

export const metadata: Metadata = {
  title: "FeatureFlow Dashboard",
  description: "Manage your feature flags with ease.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers> {/* <-- Wrap children in Providers */}
          {children}
        </Providers>
      </body>
    </html>
  );
}