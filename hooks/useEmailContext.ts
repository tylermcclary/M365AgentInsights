"use client";

import { useEffect, useState } from "react";
import { subscribeContext, triggerAnalysisForEmail, type ContextEvent } from "@/services/contextAnalyzer";

export type SelectedEmail = {
  id?: string;
  sender?: string;
  senderEmail?: string;
  subject?: string;
  body?: string;
  timestamp?: string;
} | null;

export function useEmailContext(selected: SelectedEmail) {
  const [context, setContext] = useState<ContextEvent | null>(null);

  useEffect(() => {
    const unsub = subscribeContext(e => setContext(e));
    return () => unsub();
  }, []);

  useEffect(() => {
    const email = selected?.senderEmail ?? selected?.sender;
    if (email) {
      triggerAnalysisForEmail(email);
    }
  }, [selected?.senderEmail, selected?.sender]);

  return context;
}
