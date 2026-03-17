"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Loader2 } from "lucide-react";
import { supabase } from "../../../config/supabase";

export default function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setIsLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg ring-1 ring-gray-200">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Create an Account</h2>
        <p className="text-sm text-gray-500">Start controlling your features today.</p>
      </div>

      <form onSubmit={handleSignup} className="space-y-5">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Email Address</label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
              placeholder="you@company.com"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
              placeholder="Create a strong password"
              minLength={6}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:bg-blue-400"
        >
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign Up"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
          Log in
        </Link>
      </p>
    </div>
  );
}