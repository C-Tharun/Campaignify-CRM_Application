import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { CampaignService } from "@/lib/services/campaignService";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = await CampaignService.getCampaignStats(params.id);
    return NextResponse.json(stats);
  } catch (error) {
    console.error("[CAMPAIGN_STATS]", error);
    return NextResponse.json(
      { error: "Failed to fetch campaign stats" },
      { status: 500 }
    );
  }
} 