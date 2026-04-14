"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { forgotPassword } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await forgotPassword(email);

      if (result.error) {
        toast.error(result.error);
      } else {
        setSent(true);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 px-4">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-teal-600/8 blur-3xl" />
      </div>

      <Card className="w-full max-w-md relative z-10 border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
        <CardHeader className="text-center pb-2 pt-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 shadow-lg shadow-teal-500/20">
            <Mail className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {sent ? "Check your email" : "Forgot password?"}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {sent
              ? "We've sent you a password reset link."
              : "Enter your email and we'll send you a reset link."}
          </p>
        </CardHeader>

        <CardContent className="pt-4 pb-8">
          {sent ? (
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-3 py-4">
                <CheckCircle2 className="h-12 w-12 text-teal-400" />
                <p className="text-sm text-slate-400 text-center leading-relaxed">
                  If an account with <strong className="text-slate-300">{email}</strong> exists,
                  you&apos;ll receive an email with instructions to reset your password.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => {
                    setSent(false);
                    setEmail("");
                  }}
                  variant="outline"
                  className="w-full h-11 border-white/10 bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer"
                >
                  Try a different email
                </Button>

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
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300 text-sm font-medium">
                  Email address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
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
                    Sending…
                  </>
                ) : (
                  "Send reset link"
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
