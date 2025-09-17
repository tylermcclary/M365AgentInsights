"use client";

import React from "react";
import EmailInterface from "@/components/outlook/EmailInterface";

export default function OutlookShell() {
  return <EmailInterface showAIPanel={false} />;
}