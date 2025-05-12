import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { OrderStatus, Prisma } from "@prisma/client";

// Order item validation schema
const OrderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(1),
  price: z.number().min(0),
});

// Order data validation schema
const OrderSchema = z.object({
  customerId: z.string(),
  amount: z.number().min(0),
  currency: z.string().length(3).default("USD"),
  status: z.nativeEnum(OrderStatus).default(OrderStatus.PENDING),
  items: z.array(OrderItemSchema).min(1),
  createdAt: z.string().datetime().optional(),
});

type OrderData = z.infer<typeof OrderSchema>;

// Batch order data validation schema
const BatchOrderSchema = z.array(OrderSchema);

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the request body
    const body = await req.json();

    // Determine if this is a single order or batch
    const isBatch = Array.isArray(body);
    const validationSchema = isBatch ? BatchOrderSchema : OrderSchema;

    // Validate the data
    const validationResult = validationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Invalid order data", 
          details: validationResult.error.format() 
        },
        { status: 400 }
      );
    }

    // Convert single order to array for consistent processing
    const orders: OrderData[] = isBatch 
      ? (validationResult.data as OrderData[])
      : [validationResult.data as OrderData];

    const results = {
      created: 0,
      updated: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Process each order
    for (const order of orders) {
      try {
        // Verify customer exists
        const customer = await prisma.customer.findUnique({
          where: { id: order.customerId },
        });

        if (!customer) {
          throw new Error(`Customer not found: ${order.customerId}`);
        }

        // Create order in a transaction
        await prisma.$transaction(async (tx) => {
          // Create the order
          const createdOrder = await tx.order.create({
            data: {
              customerId: order.customerId,
              amount: order.amount,
              currency: order.currency,
              status: order.status as OrderStatus,
              createdAt: order.createdAt ? new Date(order.createdAt) : undefined,
            },
          });

          // Create order items
          await tx.orderItem.createMany({
            data: order.items.map((item) => ({
              orderId: createdOrder.id,
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          });

          // Update customer's total spent and visit count
          await tx.customer.update({
            where: { id: order.customerId },
            data: {
              totalSpent: {
                increment: order.amount,
              },
              lastVisit: new Date(),
              visitCount: {
                increment: 1,
              },
            },
          });
        });

        results.created++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(
          `Failed to process order for customer ${order.customerId}: ${error.message}`
        );
      }
    }

    return NextResponse.json({
      message: isBatch ? "Batch order processing completed" : "Order created successfully",
      results,
    });
  } catch (error) {
    console.error("Error processing order data:", error);
    return NextResponse.json(
      { error: "Failed to process order data" },
      { status: 500 }
    );
  }
}

// Get all orders with pagination and filtering
export async function GET(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const customerId = searchParams.get("customerId");
    const status = searchParams.get("status") as OrderStatus | null;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: Prisma.OrderWhereInput = {
      ...(customerId && { customerId }),
      ...(status && { status }),
      ...(startDate && endDate && {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      }),
    };

    // Get orders with pagination
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          customer: {
            select: {
              name: true,
              email: true,
            },
          },
          items: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
} 