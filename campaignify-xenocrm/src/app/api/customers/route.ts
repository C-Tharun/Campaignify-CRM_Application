import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Customer data validation schema
const CustomerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  country: z.string().min(2),
  totalSpent: z.number().min(0),
  lastVisit: z.string().datetime().optional(),
  visitCount: z.number().min(0),
});

// Batch customer data validation schema
const BatchCustomerSchema = z.array(CustomerSchema);

export async function POST(req: Request) {
  try {
    // Get the request body
    const body = await req.json();
    console.log("Received customer data:", body);

    // Validate the data
    const validationResult = BatchCustomerSchema.safeParse(body);
    if (!validationResult.success) {
      console.log("Validation failed:", validationResult.error);
      return NextResponse.json(
        { error: "Invalid customer data", details: validationResult.error },
        { status: 400 }
      );
    }

    const customers = validationResult.data;
    const results = {
      created: 0,
      updated: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Process each customer
    for (const customer of customers) {
      try {
        // Check if customer exists
        const existingCustomer = await prisma.customer.findUnique({
          where: { email: customer.email },
        });

        if (existingCustomer) {
          // Update existing customer
          await prisma.customer.update({
            where: { email: customer.email },
            data: {
              name: customer.name,
              country: customer.country,
              totalSpent: customer.totalSpent,
              lastVisit: customer.lastVisit ? new Date(customer.lastVisit) : existingCustomer.lastVisit,
              visitCount: customer.visitCount,
            },
          });
          results.updated++;
        } else {
          // Create new customer
          await prisma.customer.create({
            data: {
              email: customer.email,
              name: customer.name,
              country: customer.country,
              totalSpent: customer.totalSpent,
              lastVisit: customer.lastVisit ? new Date(customer.lastVisit) : null,
              visitCount: customer.visitCount,
            },
          });
          results.created++;
        }
      } catch (error: any) {
        results.failed++;
        results.errors.push(`Failed to process customer ${customer.email}: ${error.message}`);
      }
    }

    return NextResponse.json({
      message: "Customer data processed",
      results,
    });
  } catch (error) {
    console.error("Error processing customer data:", error);
    return NextResponse.json(
      { error: "Failed to process customer data" },
      { status: 500 }
    );
  }
}

// Get all customers with pagination and filtering
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    // Build where clause for search
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { country: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    // Get customers with pagination
    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.customer.count({ where }),
    ]);

    return NextResponse.json({
      customers,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
} 