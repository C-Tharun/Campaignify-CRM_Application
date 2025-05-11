import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { authOptions } from "@/lib/auth";

// Validation schema for campaign data
const campaignSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  segmentId: z.string().min(1, "Segment is required"),
  status: z.enum(["DRAFT", "SCHEDULED", "SENDING", "COMPLETED", "FAILED"] as const),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log("Session:", session); // Debug log

    if (!session?.user?.email) {
      console.log("No session or email found"); // Debug log
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user ID from email
    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    console.log("Found user:", user); // Debug log

    if (!user) {
      // If user doesn't exist, create them
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || "",
          image: session.user.image || "",
        },
      });
      console.log("Created new user:", user); // Debug log
    }

    const body = await request.json();
    console.log("Request body:", body); // Debug log
    const validationResult = campaignSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.log("Validation failed:", validationResult.error); // Debug log
      return NextResponse.json(
        { error: "Invalid campaign data", details: validationResult.error.errors },
        { status: 400 }
      );
    }

    // Verify segment exists
    const segment = await prisma.segment.findUnique({
      where: { id: validationResult.data.segmentId },
    });
    console.log("Found segment:", segment); // Debug log

    if (!segment) {
      return NextResponse.json(
        { error: "Selected segment not found" },
        { status: 404 }
      );
    }

    const campaign = await prisma.campaign.create({
      data: {
        name: validationResult.data.name,
        description: validationResult.data.description,
        segmentId: validationResult.data.segmentId,
        status: validationResult.data.status,
        userId: user.id,
      },
      include: {
        segment: true,
      },
    });
    console.log("Created campaign:", campaign); // Debug log

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error("Error creating campaign:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create campaign" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user ID from email
    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      // If user doesn't exist, create them
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || "",
          image: session.user.image || "",
        },
      });
    }

    const campaigns = await prisma.campaign.findMany({
      where: {
        userId: user.id,
      },
        include: {
          segment: true,
        },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
} 