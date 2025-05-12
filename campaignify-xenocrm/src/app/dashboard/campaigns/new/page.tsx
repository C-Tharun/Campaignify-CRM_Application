import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { CampaignForm } from "@/components/forms/CampaignForm";

const prisma = new PrismaClient();

export default async function NewCampaignPage() {
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
    <div className="max-w-4xl mx-auto py-12">
      <h1 className="text-3xl font-extrabold mb-8 text-gray-900 bg-gradient-to-r from-blue-700 via-purple-600 to-pink-500 bg-clip-text text-transparent drop-shadow-lg animate-fade-in-down">
        Create New Campaign
      </h1>
      <div className="card animate-fade-in-up">
        <CampaignForm segments={segments} />
      </div>
    </div>
  );
} 