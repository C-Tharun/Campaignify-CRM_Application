import React from "react";
import { CampaignStatus } from "@prisma/client";

interface CampaignActionsProps {
  campaign: {
    id: string;
    status: CampaignStatus;
  };
}

export function CampaignActions({ campaign }: CampaignActionsProps) {
  const [isExecuting, setIsExecuting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const executeCampaign = async () => {
    try {
      setIsExecuting(true);
      setError(null);

      const response = await fetch(`/api/campaigns/${campaign.id}/execute`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to execute campaign");
      }

      // Refresh the page to show updated status
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to execute campaign");
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Campaign Actions</h2>
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      <div className="space-y-4">
        {campaign.status === CampaignStatus.SCHEDULED && (
          <button
            onClick={executeCampaign}
            disabled={isExecuting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExecuting ? "Executing..." : "Execute Campaign"}
          </button>
        )}
        {campaign.status === CampaignStatus.SENDING && (
          <div className="text-center text-gray-600">
            Campaign is currently being executed...
          </div>
        )}
        {campaign.status === CampaignStatus.COMPLETED && (
          <div className="text-center text-green-600">
            Campaign has been completed successfully!
          </div>
        )}
        {campaign.status === CampaignStatus.FAILED && (
          <div className="text-center text-red-600">
            Campaign execution failed. Please try again.
          </div>
        )}
      </div>
    </div>
  );
} 