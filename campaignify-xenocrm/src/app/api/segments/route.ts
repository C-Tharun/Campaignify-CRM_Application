import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

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

    // Create the segment
    const segment = await prisma.segment.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        rules: criteria,
      },
    });

    // --- Associate customers to segment based on rules ---
    // Example supported rules: { "inactiveDays": 90, "minSpend": 5000 }
    let matchingCustomers: any[] = [];
    if (criteria.inactiveDays !== undefined && criteria.minSpend !== undefined) {
      const inactiveDate = new Date(Date.now() - criteria.inactiveDays * 24 * 60 * 60 * 1000);
      // Get all customers with their orders
      const customers = await prisma.customer.findMany({
        include: { orders: true },
      });
      matchingCustomers = customers.filter((customer) => {
        // Find the latest order (or undefined)
        const lastOrder = customer.orders.length > 0
          ? customer.orders.reduce((latest, order) =>
              order.createdAt > latest.createdAt ? order : latest
            )
          : undefined;
        const totalSpend = customer.orders.reduce((sum, order) => sum + order.amount, 0);
        return (
          (!lastOrder || lastOrder.createdAt < inactiveDate) &&
          totalSpend > criteria.minSpend
        );
      });
      console.log(`[Segment] Found ${matchingCustomers.length} matching customers for segment '${segment.name}' (${segment.id}):`, matchingCustomers.map(c => c.id));
      if (matchingCustomers.length === 0) {
        console.warn(`[Segment] No customers matched the criteria for segment '${segment.name}' (${segment.id}).`);
      }
    } else {
      // Fallback: associate all customers (or handle other rule types as needed)
      matchingCustomers = await prisma.customer.findMany();
      console.log(`[Segment] Fallback: associating all customers (${matchingCustomers.length}) to segment '${segment.name}' (${segment.id})`);
    }

    // Update segment's customers relation
    if (matchingCustomers.length > 0) {
      await prisma.segment.update({
        where: { id: segment.id },
        data: {
          customers: {
            set: matchingCustomers.map((c) => ({ id: c.id })),
          },
        },
      });
    }

    // Return the segment (with customer count)
    const segmentWithCount = await prisma.segment.findUnique({
      where: { id: segment.id },
      include: {
        _count: { select: { customers: true } },
      },
    });

    return NextResponse.json(segmentWithCount);
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