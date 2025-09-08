"use client";

import { msalInstance, graphScopes } from "@/lib/msal";
import type { AccountInfo, AuthenticationResult } from "@azure/msal-browser";

const BYPASS = (process.env.NEXT_PUBLIC_BYPASS_AUTH ?? "").toLowerCase() === "true";

export function isBypassAuth(): boolean {
  return BYPASS;
}

export function getActiveAccount(): AccountInfo | null {
  const acct = msalInstance.getActiveAccount();
  if (acct) return acct;
  const all = msalInstance.getAllAccounts();
  if (all.length > 0) {
    msalInstance.setActiveAccount(all[0]);
    return all[0];
  }
  return null;
}

export async function signIn(): Promise<AuthenticationResult | null> {
  if (BYPASS) return null;
  const res = await msalInstance.loginPopup({ scopes: graphScopes });
  msalInstance.setActiveAccount(res.account ?? null);
  return res;
}

export async function signOut(): Promise<void> {
  if (BYPASS) return;
  const account = getActiveAccount();
  await msalInstance.logoutPopup({ account: account ?? undefined });
}

export async function getAccessToken(): Promise<string> {
  if (BYPASS) return "mock_access_token";
  const account = getActiveAccount();
  if (!account) {
    await signIn();
  }
  const acct = getActiveAccount();
  if (!acct) throw new Error("No active account after sign-in");
  const token = await msalInstance.acquireTokenSilent({ scopes: graphScopes, account: acct });
  return token.accessToken;
}


