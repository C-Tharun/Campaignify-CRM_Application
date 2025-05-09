import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const segmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  criteria: z.string().min(1, "Criteria is required"),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const validatedData = segmentSchema.parse(body);

    // Parse the criteria JSON string
    let criteria;
    try {
      criteria = JSON.parse(validatedData.criteria);
    } catch (error) {
      return new NextResponse("Invalid criteria JSON", { status: 400 });
    }

    const segment = await prisma.segment.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        criteria: criteria,
      },
    });

    return NextResponse.json(segment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 });
    }

    console.error("[SEGMENTS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const [segments, total] = await Promise.all([
      prisma.segment.findMany({
        skip,
        take: limit,
        include: {
          _count: {
            select: { customers: true },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.segment.count(),
    ]);

    return NextResponse.json({
      segments,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("[SEGMENTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 