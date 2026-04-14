"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { resetPassword } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2, Lock, ArrowLeft, ShieldCheck } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    if (!token) {
      toast.error("Invalid reset link. Please request a new one.");
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword(token, password);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
        router.push("/login?reset=success");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // No token in URL — show error state
  if (!token) {
    return (
      <Card className="w-full max-w-md relative z-10 border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
        <CardHeader className="text-center pb-2 pt-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-700 shadow-lg shadow-red-500/20">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Invalid reset link
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            This password reset link is invalid or has expired.
          </p>
        </CardHeader>
        <CardContent className="pt-4 pb-8">
          <div className="space-y-3">
            <Link href="/forgot-password" className="block">
              <Button className="w-full h-11 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white font-semibold shadow-lg shadow-teal-500/20 cursor-pointer">
                Request a new link
              </Button>
            </Link>
            <Link href="/login" className="block">
              <Button
                variant="ghost"
                className="w-full h-11 text-teal-400 hover:text-teal-300 hover:bg-teal-500/10 cursor-pointer"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md relative z-10 border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
      <CardHeader className="text-center pb-2 pt-8">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 shadow-lg shadow-teal-500/20">
          <ShieldCheck className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Set new password
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Choose a strong password for your account.
        </p>
      </CardHeader>

      <CardContent className="pt-4 pb-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-300 text-sm font-medium">
              New password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="pl-10 bg-slate-800/60 border-white/10 text-white placeholder:text-slate-500 focus:border-teal-500 focus:ring-teal-500/20 h-11"
              />
            </div>
            <p className="text-xs text-slate-500">Must be at least 8 characters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-slate-300 text-sm font-medium">
              Confirm password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="pl-10 bg-slate-800/60 border-white/10 text-white placeholder:text-slate-500 focus:border-teal-500 focus:ring-teal-500/20 h-11"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white font-semibold shadow-lg shadow-teal-500/20 transition-all duration-200 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting…
              </>
            ) : (
              "Reset password"
            )}
          </Button>

          <Link href="/login" className="block">
            <Button
              type="button"
              variant="ghost"
              className="w-full h-11 text-teal-400 hover:text-teal-300 hover:bg-teal-500/10 cursor-pointer"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </Button>
          </Link>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 px-4">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-teal-600/8 blur-3xl" />
      </div>

      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
