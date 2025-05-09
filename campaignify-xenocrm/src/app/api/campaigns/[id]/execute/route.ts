import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { CampaignService } from "@/lib/campaignService";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const campaignId = params.id;
    const campaign = await CampaignService.executeCampaign(campaignId);

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("Error executing campaign:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to execute campaign" },
      { status: 500 }
    );
  }
} 