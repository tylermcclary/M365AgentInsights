"use client";

import React, { useState } from "react";
import OutlookMainInterface from "@/components/outlook/OutlookMainInterface";

export default function OutlookWithAI() {
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);

  return (
    <div className="h-screen w-full">
      <OutlookMainInterface />
    </div>
  );
}