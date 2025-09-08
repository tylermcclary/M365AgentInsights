"use client";

import DemoControlPanel from "@/components/demo/DemoControlPanel";

export default function DemoPage() {
  return (
    <main className="max-w-6xl mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">AI Agent Demo</h1>
      <p className="text-sm text-neutral-600">Explore capabilities: simulated Graph data, client insights, next best actions, and interaction timeline.</p>
      <DemoControlPanel />
    </main>
  );
}


