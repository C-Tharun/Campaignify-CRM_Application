interface CampaignStatsProps {
  stats: {
    totalCustomers: number;
    messages: {
      total: number;
      sent: number;
      failed: number;
      pending: number;
    };
  };
}

export default function CampaignStats({ stats }: CampaignStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">
            Total Customers
          </dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">
            {stats.totalCustomers}
          </dd>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">
            Messages Sent
          </dt>
          <dd className="mt-1 text-3xl font-semibold text-green-600">
            {stats.messages.sent}
          </dd>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">
            Messages Failed
          </dt>
          <dd className="mt-1 text-3xl font-semibold text-red-600">
            {stats.messages.failed}
          </dd>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">
            Messages Pending
          </dt>
          <dd className="mt-1 text-3xl font-semibold text-yellow-600">
            {stats.messages.pending}
          </dd>
        </div>
      </div>
    </div>
  );
} 