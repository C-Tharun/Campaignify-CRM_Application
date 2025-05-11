import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const segmentSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  criteria: z.string().transform((str) => {
    try {
      return JSON.parse(str);
    } catch (e) {
      throw new Error("Invalid JSON in criteria");
    }
  }),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validationResult = segmentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid segment data", details: validationResult.error },
        { status: 400 }
      );
    }

    const segment = await prisma.segment.create({
      data: {
        name: validationResult.data.name,
        description: validationResult.data.description,
        rules: validationResult.data.criteria,
      },
    });

    return NextResponse.json(segment);
  } catch (error) {
    console.error("Error creating segment:", error);
    return NextResponse.json(
      { error: "Failed to create segment" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const segments = await prisma.segment.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(segments);
  } catch (error) {
    console.error("Error fetching segments:", error);
    return NextResponse.json(
      { error: "Failed to fetch segments" },
      { status: 500 }
    );
  }
} 