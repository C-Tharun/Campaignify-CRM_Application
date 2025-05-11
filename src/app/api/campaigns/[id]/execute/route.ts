import { NextResponse } from "next/server";
import { CampaignService } from "@/lib/campaignService";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface RouteContext {
  params: { id: string };
}

export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const campaign = await CampaignService.executeCampaign(context.params.id);

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("Error executing campaign:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to execute campaign" },
      { status: 500 }
    );
  }
} 