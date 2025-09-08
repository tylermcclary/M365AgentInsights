"use client";

import { useEffect } from "react";
import type { Communication } from "@/services/ai-insights";
import { triggerAnalysisForEmail } from "@/services/contextAnalyzer";

export default function ContextTrigger({
  senderEmail,
  communications,
}: {
  senderEmail?: string;
  communications?: Communication[];
}) {
  useEffect(() => {
    if (senderEmail) {
      triggerAnalysisForEmail(senderEmail);
    }
  }, [senderEmail]);
  return null;
}


