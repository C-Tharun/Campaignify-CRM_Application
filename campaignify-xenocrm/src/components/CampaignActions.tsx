"use client";

import { useState } from "react";
import { Campaign } from "@prisma/client";

interface CampaignActionsProps {
  campaign: Campaign;
}

export default function CampaignActions({ campaign }: CampaignActionsProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExecute = async () => {
    try {
      setIsExecuting(true);
      setError(null);

      const response = await fetch(`/api/campaigns/${campaign.id}/execute`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to execute campaign");
      }

      // Refresh the page to show updated status
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      {error && (
        <div className="text-red-600 text-sm mb-2">{error}</div>
      )}
      <button
        onClick={handleExecute}
        disabled={isExecuting || campaign.status === "SENDING" || campaign.status === "COMPLETED"}
        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
          isExecuting || campaign.status === "SENDING" || campaign.status === "COMPLETED"
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        }`}
      >
        {isExecuting ? "Executing..." : "Execute Campaign"}
      </button>
    </div>
  );
} 