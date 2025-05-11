import React from "react";

interface CampaignStatsProps {
  stats: {
    totalCustomers: number;
    delivered: number;
    failed: number;
    pending: number;
  };
}

export default function CampaignStats({ stats }: CampaignStatsProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <dl className="grid grid-cols-2 gap-x-8 gap-y-4">
        <div>
          <dt className="text-sm font-medium text-gray-500">Total Customers</dt>
          <dd className="mt-1 text-2xl font-semibold text-gray-900">{stats.totalCustomers}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Delivered</dt>
          <dd className="mt-1 text-2xl font-semibold text-green-600">{stats.delivered}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Failed</dt>
          <dd className="mt-1 text-2xl font-semibold text-red-600">{stats.failed}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Pending</dt>
          <dd className="mt-1 text-2xl font-semibold text-yellow-600">{stats.pending}</dd>
        </div>
      </dl>
    </div>
  );
} 