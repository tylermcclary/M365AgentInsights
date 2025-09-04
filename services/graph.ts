"use client";

import "isomorphic-fetch";
import { PublicClientApplication, type AccountInfo } from "@azure/msal-browser";
import { Client } from "@microsoft/microsoft-graph-client";
import { msalInstance, graphScopes } from "@/lib/msal";

export function getActiveAccount(): AccountInfo | null {
  const account = msalInstance.getActiveAccount();
  if (account) return account;
  const all = msalInstance.getAllAccounts();
  if (all.length > 0) {
    msalInstance.setActiveAccount(all[0]);
    return all[0];
  }
  return null;
}

async function acquireToken(instance: PublicClientApplication): Promise<string> {
  const account = getActiveAccount();
  if (!account) {
    const login = await instance.loginPopup({ scopes: graphScopes });
    instance.setActiveAccount(login.account ?? null);
  }
  const acct = getActiveAccount();
  if (!acct) throw new Error("No active account after login");
  const tokenResp = await instance.acquireTokenSilent({ scopes: graphScopes, account: acct });
  return tokenResp.accessToken;
}

export async function createGraphClient() {
  const accessToken = await acquireToken(msalInstance);
  return Client.init({
    authProvider: done => {
      done(null, accessToken);
    },
  });
}

export async function getMe() {
  const client = await createGraphClient();
  return client.api("/me").get();
}

export async function getMailTop(limit = 10) {
  const client = await createGraphClient();
  return client.api("/me/messages").select(["id", "subject", "from", "receivedDateTime"]).top(limit).get();
}

export async function getUpcomingEvents(limit = 10) {
  const client = await createGraphClient();
  return client.api("/me/events").select(["id", "subject", "start", "end", "organizer"]).top(limit).get();
}


