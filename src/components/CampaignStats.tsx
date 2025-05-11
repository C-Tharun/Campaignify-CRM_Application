"use client";

import { useState, useEffect } from "react";

interface CampaignStatsProps {
  campaignId: string;
}

interface Stats {
  total: number;
  sent: number;
  delivered: number;
  failed: number;
  pending: number;
}

export default function CampaignStats({ campaignId }: CampaignStatsProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/campaigns/${campaignId}/stats`);
        if (!response.ok) {
          throw new Error("Failed to fetch campaign stats");
        }
        const data = await response.json();
        setStats(data.messageStats);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [campaignId]);

  if (loading) {
    return <div>Loading campaign statistics...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  if (!stats) {
    return <div>No statistics available</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Campaign Statistics
      </h3>
      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="px-4 py-5 bg-gray-50 rounded-lg">
          <dt className="text-sm font-medium text-gray-500">Total Messages</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">
            {stats.total}
          </dd>
        </div>
        <div className="px-4 py-5 bg-gray-50 rounded-lg">
          <dt className="text-sm font-medium text-gray-500">Sent</dt>
          <dd className="mt-1 text-3xl font-semibold text-blue-600">
            {stats.sent}
          </dd>
        </div>
        <div className="px-4 py-5 bg-gray-50 rounded-lg">
          <dt className="text-sm font-medium text-gray-500">Delivered</dt>
          <dd className="mt-1 text-3xl font-semibold text-green-600">
            {stats.delivered}
          </dd>
        </div>
        <div className="px-4 py-5 bg-gray-50 rounded-lg">
          <dt className="text-sm font-medium text-gray-500">Failed</dt>
          <dd className="mt-1 text-3xl font-semibold text-red-600">
            {stats.failed}
          </dd>
        </div>
        <div className="px-4 py-5 bg-gray-50 rounded-lg">
          <dt className="text-sm font-medium text-gray-500">Pending</dt>
          <dd className="mt-1 text-3xl font-semibold text-yellow-600">
            {stats.pending}
          </dd>
        </div>
        <div className="px-4 py-5 bg-gray-50 rounded-lg">
          <dt className="text-sm font-medium text-gray-500">Success Rate</dt>
          <dd className="mt-1 text-3xl font-semibold text-indigo-600">
            {stats.total > 0
              ? `${Math.round((stats.delivered / stats.total) * 100)}%`
              : "0%"}
          </dd>
        </div>
      </dl>
    </div>
  );
} 