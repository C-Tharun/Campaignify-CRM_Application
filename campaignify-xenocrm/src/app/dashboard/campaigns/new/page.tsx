import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CampaignForm from "@/components/forms/CampaignForm";

export default async function CreateCampaignPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/auth/signin");
  }

  const segments = await prisma.segment.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Create New Campaign
              </h2>
            </div>
          </div>

          <div className="mt-8">
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <CampaignForm segments={segments} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 