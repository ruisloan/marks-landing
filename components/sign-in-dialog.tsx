"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signInWithOtp, verifyOtp } from "@/lib/auth";
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
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendCode();
            }}
            className="space-y-3"
          >
            <Input
              type="email"
              autoFocus
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={busy}
            />
            <Button type="submit" className="w-full" disabled={busy || !email}>
              {busy ? "Sending…" : "Send code"}
            </Button>
            <p className="text-[11px] text-white/40 text-center">
              By signing in you agree to store your bookmarks securely in our cloud (Supabase, EU region).
            </p>
          </form>
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
