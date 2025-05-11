import React from "react";

interface CampaignStatsProps {
  stats: {
    total: number;
    delivered: number;
    failed: number;
    pending: number;
    totalCustomers: number;
  };
}

export function CampaignStats({ stats }: CampaignStatsProps) {
  const deliveryRate = stats.total > 0 ? (stats.delivered / stats.total) * 100 : 0;
  const failureRate = stats.total > 0 ? (stats.failed / stats.total) * 100 : 0;
  const pendingRate = stats.total > 0 ? (stats.pending / stats.total) * 100 : 0;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-600">Total Customers</h3>
          <p className="mt-2 text-3xl font-semibold text-blue-900">
            {stats.totalCustomers}
          </p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <h3 className="text-sm font-medium text-green-600">Messages Delivered</h3>
          <p className="mt-2 text-3xl font-semibold text-green-900">
            {stats.delivered}
          </p>
          <p className="mt-1 text-sm text-green-600">
            {deliveryRate.toFixed(1)}% success rate
          </p>
        </div>
        <div className="p-4 bg-red-50 rounded-lg">
          <h3 className="text-sm font-medium text-red-600">Messages Failed</h3>
          <p className="mt-2 text-3xl font-semibold text-red-900">
            {stats.failed}
          </p>
          <p className="mt-1 text-sm text-red-600">
            {failureRate.toFixed(1)}% failure rate
          </p>
        </div>
        <div className="p-4 bg-yellow-50 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-600">Messages Pending</h3>
          <p className="mt-2 text-3xl font-semibold text-yellow-900">
            {stats.pending}
          </p>
          <p className="mt-1 text-sm text-yellow-600">
            {pendingRate.toFixed(1)}% pending
          </p>
        </div>
      </div>
    </div>
  );
} 