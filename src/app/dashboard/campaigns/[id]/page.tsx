import React from 'react';
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { CampaignService } from "@/lib/services/campaignService";
import CampaignActions from "@/components/ui/CampaignActions";
import CampaignStats from "@/components/ui/CampaignStats";

export default async function CampaignDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/auth/signin");
  }

  // Use CampaignService to get campaign and stats (with segment customers included)
  const { campaign, stats } = await CampaignService.getCampaignStats(params.id);

  if (!campaign) {
    redirect("/dashboard/campaigns");
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              {campaign.name}
            </h2>
            <p className="mt-1 text-sm text-gray-500">{campaign.description}</p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <CampaignActions campaign={campaign} />
          </div>
        </div>

        <div className="mt-8">
          <CampaignStats stats={stats} />
        </div>

        <div className="mt-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Campaign Details
              </h3>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Segment</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {campaign.segment?.name || "No segment"}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {campaign.status}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Created At</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {new Date(campaign.createdAt).toLocaleDateString()}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {new Date(campaign.updatedAt).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 