"use client";

import { InsightsGraph } from "@/components/insights-graph";

export default function NexusOverview() {
  return (
    <div className="h-screen max-h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 p-8 pb-4">
        <h1 className="text-3xl font-bold mb-2">Overview</h1>
        <p className="text-muted-foreground">
          Interactive 3D visualization of organizational structure and connections
        </p>
      </div>
      
      {/* Graph Container */}
      <div className="flex-1 min-h-0 px-8 pb-8">
        <div className="h-full max-h-full bg-gradient-to-br from-gray-50 to-white rounded-xl border shadow-sm overflow-hidden">
          <InsightsGraph />
        </div>
      </div>
    </div>
  );
}
