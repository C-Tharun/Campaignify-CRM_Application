import { Redis } from "ioredis";
import { prisma } from "@/lib/prisma";

// Create Redis client
export const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

// Handle Redis connection events
redis.on("connect", () => {
  console.log("Connected to Redis");
});

redis.on("error", (error: Error) => {
  console.error("Redis connection error:", error);
});

// Consumer function to process customer data
export async function startCustomerConsumer() {
  const consumerGroup = "customer-processor";
  const stream = "customer-ingest";

  try {
    // Create consumer group if it doesn't exist
    await redis.xgroup("CREATE", stream, consumerGroup, "0", "MKSTREAM").catch(() => {
      // Group might already exist, which is fine
    });

    while (true) {
      // Read new messages from the stream
      const messages = await redis.xreadgroup(
        "GROUP",
        consumerGroup,
        "customer-worker",
        "COUNT",
        "1",
        "BLOCK",
        "2000",
        "STREAMS",
        stream,
        ">"
      );

      if (!messages) continue;

      for (const [stream, streamMessages] of messages) {
        for (const [id, fields] of streamMessages) {
          try {
            const data = JSON.parse(fields.data);
            
            // Process customer data in batches
            await prisma.customer.createMany({
              data: data.map((customer: any) => ({
                name: customer.name,
                email: customer.email,
                country: customer.country,
                totalSpent: customer.totalSpent,
                lastVisit: customer.lastVisit ? new Date(customer.lastVisit) : null,
                visitCount: customer.visitCount,
              })),
              skipDuplicates: true, // Skip if email already exists
            });

            // Acknowledge the message
            await redis.xack(stream, consumerGroup, id);
          } catch (error) {
            console.error("Error processing customer data:", error);
            // You might want to move failed messages to a dead letter queue
          }
        }
      }
    }
  } catch (error) {
    console.error("Consumer error:", error);
    // Restart consumer after a delay
    setTimeout(startCustomerConsumer, 5000);
  }
}

// Consumer function to process order data
export async function startOrderConsumer() {
  const consumerGroup = "order-processor";
  const stream = "order-ingest";

  try {
    // Create consumer group if it doesn't exist
    await redis.xgroup("CREATE", stream, consumerGroup, "0", "MKSTREAM").catch(() => {
      // Group might already exist, which is fine
    });

    while (true) {
      // Read new messages from the stream
      const messages = await redis.xreadgroup(
        "GROUP",
        consumerGroup,
        "order-worker",
        "COUNT",
        "1",
        "BLOCK",
        "2000",
        "STREAMS",
        stream,
        ">"
      ) as [string, [string, Record<string, string>][]] | null;

      if (!messages) continue;

      for (const [stream, streamMessages] of messages) {
        for (const [id, fields] of streamMessages) {
          try {
            const data = JSON.parse(fields.data);
            
            // Process orders in a transaction
            for (const order of data) {
              await prisma.$transaction(async (tx) => {
                // Create the order
                const createdOrder = await tx.order.create({
                  data: {
                    customerId: order.customerId,
                    amount: order.amount,
                    currency: order.currency,
                    status: order.status,
                    createdAt: new Date(order.createdAt),
                  },
                });

                // Create order items
                await tx.orderItem.createMany({
                  data: order.items.map((item: any) => ({
                    orderId: createdOrder.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price,
                  })),
                });

                // Update customer's total spent
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
            }

            // Acknowledge the message
            await redis.xack(stream, consumerGroup, id);
          } catch (error) {
            console.error("Error processing order data:", error);
            // You might want to move failed messages to a dead letter queue
          }
        }
      }
    }
  } catch (error) {
    console.error("Consumer error:", error);
    // Restart consumer after a delay
    setTimeout(startOrderConsumer, 5000);
  }
}