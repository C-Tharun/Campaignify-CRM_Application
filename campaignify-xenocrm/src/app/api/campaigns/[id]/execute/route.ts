import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { CampaignService } from "@/lib/services/campaignService";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const campaign = await CampaignService.executeCampaign(params.id);
    return Response.json(campaign);
  } catch (error) {
    console.error("Error executing campaign:", error);
    return new Response(
      error instanceof Error ? error.message : "Failed to execute campaign",
      { status: 500 }
    );
  }
} 