"use client";

import { PublicClientApplication, type Configuration, type LogLevel } from "@azure/msal-browser";

const clientId = process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID ?? "";
const authority = process.env.NEXT_PUBLIC_AZURE_AD_AUTHORITY ?? (process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID
  ? `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID}`
  : "");
const redirectUri = process.env.NEXT_PUBLIC_AZURE_AD_REDIRECT_URI ?? "http://localhost:3000";

if (!clientId) {
  // eslint-disable-next-line no-console
  console.warn("MSAL: NEXT_PUBLIC_AZURE_AD_CLIENT_ID is not set.");
}

const msalConfig: Configuration = {
  auth: {
    clientId,
    authority,
    redirectUri,
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      logLevel: LogLevel.Warning,
      loggerCallback: () => {},
    },
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);

export const graphScopes: string[] = (process.env.NEXT_PUBLIC_GRAPH_SCOPES ?? "User.Read").split(/[,\s]+/).filter(Boolean);


