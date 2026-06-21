"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signInWithOtp, signInWithGoogle, verifyOtp } from "@/lib/auth";
import { migrateLocalToCloud } from "@/lib/storage";
import { toast } from "sonner";

type Step = "email" | "code";

export function SignInDialog({
  open,
  onOpenChange,
  onSignedIn,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSignedIn?: () => void;
}) {
  const [step, setStep] = React.useState<Step>("email");
  const [email, setEmail] = React.useState("");
  const [code, setCode] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep("email");
        setCode("");
        setBusy(false);
      }, 200);
    }
  }, [open]);

  async function sendCode() {
    if (!email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }
    setBusy(true);
    try {
      await signInWithOtp(email.trim().toLowerCase());
      setStep("code");
      toast.success("Check your inbox", { description: "We sent you a 6-digit code." });
    } catch (e: any) {
      toast.error("Couldn't send code", { description: e.message ?? String(e) });
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    if (code.replace(/\D/g, "").length < 6) {
      toast.error("Enter the 6-digit code");
      return;
    }
    setBusy(true);
    try {
      await verifyOtp(email.trim().toLowerCase(), code.replace(/\D/g, ""));
      // Migrate local data to cloud on first sign-in.
      try {
        const result = await migrateLocalToCloud();
        if (result && result.pushed > 0) {
          toast.success(`Synced ${result.pushed} items to cloud`);
        }
      } catch (e: any) {
        toast.error("Sync failed", { description: e.message ?? String(e) });
      }
      onOpenChange(false);
      onSignedIn?.();
      toast.success("Signed in", { description: "Your bookmarks will now sync across devices." });
    } catch (e: any) {
      toast.error("Invalid code", { description: e.message ?? String(e) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{step === "email" ? "Sign in to sync" : "Enter the 6-digit code"}</DialogTitle>
          <DialogDescription>
            {step === "email"
              ? "Sync your bookmarks across Chrome, iPhone, iPad and Android. No password needed."
              : `We sent a code to ${email}. It expires in 10 minutes.`}
          </DialogDescription>
        </DialogHeader>

        {step === "email" ? (
          <div className="space-y-3">
            <button
              type="button"
              onClick={async () => {
                setBusy(true);
                try {
                  await signInWithGoogle();
                  // Redirect happens; component will unmount.
                } catch (e: any) {
                  toast.error("Google sign-in failed", { description: e.message ?? String(e) });
                  setBusy(false);
                }
              }}
              disabled={busy}
              className="w-full inline-flex items-center justify-center gap-2.5 rounded-xl bg-white text-slate-900 hover:bg-white/90 disabled:opacity-50 px-4 py-2.5 text-sm font-medium transition-colors"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.07z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.12c-.22-.66-.35-1.36-.35-2.12s.13-1.46.35-2.12V7.04H2.18C1.43 8.54 1 10.22 1 12s.43 3.46 1.18 4.96l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
              </svg>
              Continue with Google
            </button>
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider text-white/30">
              <span className="h-px flex-1 bg-white/10" />
              or email
              <span className="h-px flex-1 bg-white/10" />
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendCode();
              }}
              className="space-y-3"
            >
              <Input
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={busy}
              />
              <Button type="submit" className="w-full" disabled={busy || !email}>
                {busy ? "Sending…" : "Send code"}
              </Button>
            </form>
            <p className="text-[11px] text-white/40 text-center">
              By signing in you agree to store your bookmarks securely in our cloud (Supabase, EU region).
            </p>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              verify();
            }}
            className="space-y-3"
          >
            <Input
              autoFocus
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              disabled={busy}
              className="text-center text-2xl tracking-[0.4em]"
            />
            <Button type="submit" className="w-full" disabled={busy || code.length < 6}>
              {busy ? "Verifying…" : "Verify & sign in"}
            </Button>
            <button
              type="button"
              onClick={() => setStep("email")}
              className="block w-full text-xs text-white/50 hover:text-white/80"
            >
              Use a different email
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
