"use client";

export default function NexusInsights() {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-8 pb-4">
        <h1 className="text-3xl font-bold mb-2">Insights</h1>
        <p className="text-muted-foreground">
          Deep analytics, trends, and strategic intelligence
        </p>
      </div>
      
      {/* Content */}
      <div className="flex-1 px-8 pb-8">
        <div className="h-full bg-gradient-to-br from-purple-50 to-white rounded-xl border shadow-sm p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Advanced Analytics Coming Soon</h3>
            <p className="text-gray-600 max-w-md">
              This section will feature deep insights, predictive analytics, performance metrics, 
              and strategic intelligence dashboards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
