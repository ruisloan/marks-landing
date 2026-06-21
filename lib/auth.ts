"use client";

import * as React from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabase, isSupabaseConfigured } from "./supabase";

/* ---------- Hook ---------- */

export function useAuth() {
  const [user, setUser] = React.useState<User | null>(null);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoaded(true);
      return;
    }
    const sb = getSupabase()!;
    let cancelled = false;
    sb.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setUser(data.session?.user ?? null);
      setLoaded(true);
    });
    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { user, loaded, isAuthenticated: !!user };
}

/* ---------- Imperative helpers ---------- */

const SITE_URL = "https://marks.centralbraintrust.com";

export async function signInWithGoogle() {
  if (!isSupabaseConfigured) throw new Error("Supabase not configured");
  const sb = getSupabase()!;
  const { error } = await sb.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: typeof window !== "undefined" ? window.location.origin : SITE_URL,
    },
  });
  if (error) throw error;
}

export async function signInWithOtp(email: string) {
  if (!isSupabaseConfigured) throw new Error("Supabase not configured");
  const sb = getSupabase()!;
  const { error } = await sb.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      // Where the magic link redirects after the user clicks it in the email.
      // We keep this even though we also support the 6-digit code path, so users
      // can authenticate either by tapping the link OR pasting the code.
      emailRedirectTo: typeof window !== "undefined" ? window.location.origin : SITE_URL,
    },
  });
  if (error) throw error;
}

export async function verifyOtp(email: string, token: string) {
  if (!isSupabaseConfigured) throw new Error("Supabase not configured");
  const sb = getSupabase()!;
  const { data, error } = await sb.auth.verifyOtp({
    email,
    token,
    type: "email",
  });
  if (error) throw error;
  return data.session;
}

export async function signOut() {
  if (!isSupabaseConfigured) return;
  const sb = getSupabase()!;
  await sb.auth.signOut();
}

export async function getCurrentUserId(): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  const sb = getSupabase()!;
  const { data } = await sb.auth.getUser();
  return data.user?.id ?? null;
}

/* ---------- Live state helper for non-React contexts ---------- */

let _currentSession: Session | null = null;

export function initSessionListener() {
  if (!isSupabaseConfigured) return;
  if (typeof window === "undefined") return;
  const sb = getSupabase()!;
  sb.auth.getSession().then(({ data }) => {
    _currentSession = data.session;
  });
  sb.auth.onAuthStateChange((_event, session) => {
    _currentSession = session;
  });
}

export function isAuthenticatedSync(): boolean {
  return !!_currentSession?.user;
}

export function currentUserIdSync(): string | null {
  return _currentSession?.user?.id ?? null;
}
