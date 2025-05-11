import { getServerSession } from "next-auth/next";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { CampaignService } from "@/lib/campaignService";
import { CampaignStats } from "./CampaignStats";
import { CampaignActions } from "./CampaignActions";

interface CampaignPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: CampaignPageProps) {
  const { campaign } = await CampaignService.getCampaignStats(params.id);
  return {
    title: campaign.name,
    description: campaign.description,
  };
}

export default async function CampaignDetailsPage({ params }: CampaignPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  try {
    const { campaign, stats } = await CampaignService.getCampaignStats(params.id);

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <Link
              href="/dashboard/campaigns"
              className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Campaigns
            </Link>
            <h1 className="text-3xl font-bold mb-2">{campaign.name}</h1>
            <p className="text-gray-600">{campaign.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Campaign Details</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1 text-sm text-gray-900">{campaign.status}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Target Segment</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {campaign.segment.name}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created At</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {campaign.createdAt}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created By</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {campaign.user.name}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Campaign Stats</h2>
            <CampaignStats stats={stats} />
          </div>
        </div>

        <div className="mt-8">
          <CampaignActions campaign={campaign} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading campaign:", error);
    notFound();
  }
} 