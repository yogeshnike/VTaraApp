import React from 'react';

export function DashboardTab() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Add dashboard widgets here */}
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Project Statistics</h3>
          {/* Add statistics content */}
        </div>
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
          {/* Add activity content */}
        </div>
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
          {/* Add quick actions */}
        </div>
      </div>
    </div>
  );
} 