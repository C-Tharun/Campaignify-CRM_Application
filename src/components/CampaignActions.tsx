"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CampaignActionsProps {
  campaignId: string;
  status: string;
}

export default function CampaignActions({
  campaignId,
  status,
}: CampaignActionsProps) {
  const router = useRouter();
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExecute = async () => {
    setIsExecuting(true);
    setError(null);

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/execute`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to execute campaign");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error executing campaign
              </h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      <div className="flex space-x-4">
        {status === "DRAFT" && (
          <button
            onClick={handleExecute}
            disabled={isExecuting}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isExecuting ? "Executing..." : "Execute Campaign"}
          </button>
        )}
      </div>
    </div>
  );
} 