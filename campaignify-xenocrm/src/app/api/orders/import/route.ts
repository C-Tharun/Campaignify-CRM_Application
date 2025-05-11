import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import { parse } from "csv-parse/sync";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const text = await file.text();
    const records = parse(text, {
      columns: true,
      skip_empty_lines: true,
    });

    const results = {
      created: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const record of records) {
      try {
        if (!record.customerEmail) {
          throw new Error("Customer email is required");
        }

        // Verify customer exists
        const customer = await prisma.customer.findUnique({
          where: { email: record.customerEmail },
        });

        if (!customer) {
          throw new Error(`Customer not found: ${record.customerEmail}`);
        }

        if (!record.amount || isNaN(parseFloat(record.amount))) {
          throw new Error("Valid amount is required");
        }

        if (!record.status) {
          throw new Error("Status is required");
        }

        let items;
        try {
          items = JSON.parse(record.items);
          if (!Array.isArray(items)) {
            throw new Error("Items must be an array");
          }
        } catch (e) {
          throw new Error("Invalid items JSON format");
        }

        await prisma.order.create({
          data: {
            customerId: customer.id,
            amount: parseFloat(record.amount),
            status: record.status,
            items: {
              create: items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
              })),
            },
          },
        });
        results.created++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(
          `Failed to process order for ${record.customerEmail}: ${error.message}`
        );
      }
    }

    return NextResponse.json({
      message: "Import completed",
      results,
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: "Failed to import orders" },
      { status: 500 }
    );
  }
}