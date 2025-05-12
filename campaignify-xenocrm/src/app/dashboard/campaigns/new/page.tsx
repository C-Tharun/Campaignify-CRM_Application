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
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">Create New Campaign</h1>
      <CampaignForm segments={segments} />
    </div>
  );
} 