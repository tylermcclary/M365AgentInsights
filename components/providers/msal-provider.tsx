"use client";

import { MsalProvider } from "@azure/msal-react";
import { msalInstance } from "@/lib/msal";

export function MSALClientProvider({ children }: { children: React.ReactNode }) {
  return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
}


