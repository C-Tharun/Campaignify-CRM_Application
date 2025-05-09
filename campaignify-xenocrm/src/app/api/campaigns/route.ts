import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { PrismaClient, CampaignStatus } from "@prisma/client";
import { z } from "zod";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

// Validation schema for campaign data
const campaignSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  segmentId: z.string().min(1, "Segment is required"),
  status: z.enum(["DRAFT", "SCHEDULED", "SENDING", "COMPLETED", "FAILED"] as const),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = campaignSchema.parse(body);

    // Verify segment exists
    const segment = await prisma.segment.findUnique({
      where: { id: validatedData.segmentId },
    });

    if (!segment) {
      return NextResponse.json(
        { error: "Segment not found" },
        { status: 404 }
      );
    }

    const campaign = await prisma.campaign.create({
      data: {
        ...validatedData,
        userId: session.user.id,
      },
      include: {
        segment: true,
      },
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status") as CampaignStatus | null;

    const skip = (page - 1) * limit;

    const where = status ? { status } : {};

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          segment: true,
        },
      }),
      prisma.campaign.count({ where }),
    ]);

    return NextResponse.json({
      campaigns,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 