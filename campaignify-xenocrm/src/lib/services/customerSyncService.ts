import { prisma } from "@/lib/prisma";

/**
 * Updates customer stats (totalSpent, visitCount, lastVisit) and recalculates segment membership.
 * Call this after importing orders or updating customer data.
 */
export async function syncCustomerStatsAndSegments(customerId: string) {
  // 1. Update customer stats
  const orders = await prisma.order.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
  });
  const totalSpent = orders.reduce((sum, o) => sum + o.amount, 0);
  const visitCount = orders.length;
  const lastVisit = orders[0]?.createdAt || null;

  await prisma.customer.update({
    where: { id: customerId },
    data: { totalSpent, visitCount, lastVisit },
  });

  // 2. Recalculate segment membership
  const segments = await prisma.segment.findMany();
  for (const segment of segments) {
    // Assume segment.rules is a JSON object with keys like country, minOrders, etc.
    const rules = segment.rules as any;
    let matches = true;
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) continue;
    if (rules.country && customer.country !== rules.country) matches = false;
    if (rules.minOrders && visitCount < rules.minOrders) matches = false;
    if (rules.minTotalSpent && totalSpent < rules.minTotalSpent) matches = false;
    if (rules.minDaysInactive && customer.lastVisit) {
      const daysInactive = (Date.now() - new Date(customer.lastVisit).getTime()) / (1000 * 60 * 60 * 24);
      if (daysInactive < rules.minDaysInactive) matches = false;
    }
    // Add more rule checks as needed

    if (matches) {
      // Upsert CustomerToSegment
      await prisma.customerToSegment.upsert({
        where: { customerId_segmentId: { customerId, segmentId: segment.id } },
        update: {},
        create: { customerId, segmentId: segment.id },
      });
    } else {
      // Remove if exists
      await prisma.customerToSegment.deleteMany({
        where: { customerId, segmentId: segment.id },
      });
    }
  }
} 