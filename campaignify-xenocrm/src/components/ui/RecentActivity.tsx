import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";

export default async function RecentActivity() {
  // Get recent activities
  const [recentCampaigns, recentOrders, recentCustomers] = await Promise.all([
    // Get 5 most recent campaigns
    prisma.campaign.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        segment: true,
      },
    }),
    // Get 5 most recent orders
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
      },
    }),
    // Get 5 most recently created customers
    prisma.customer.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Combine and sort all activities
  const activities = [
    ...recentCampaigns.map(campaign => ({
      type: "campaign",
      title: `Campaign "${campaign.name}" created`,
      description: `Targeting ${campaign.segment.name}`,
      timestamp: campaign.createdAt,
    })),
    ...recentOrders.map(order => ({
      type: "order",
      title: `New order from ${order.customer.name}`,
      description: `Amount: ${order.currency} ${order.amount}`,
      timestamp: order.createdAt,
    })),
    ...recentCustomers.map(customer => ({
      type: "customer",
      title: `New customer: ${customer.name}`,
      description: `From ${customer.country}`,
      timestamp: customer.createdAt,
    })),
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
   .slice(0, 5); // Get only the 5 most recent activities

  if (activities.length === 0) {
    return (
      <div className="mt-4">
        <p className="text-sm text-gray-500">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      {activities.map((activity, index) => (
        <div key={index} className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {activity.type === "campaign" && (
              <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            )}
            {activity.type === "order" && (
              <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            )}
            {activity.type === "customer" && (
              <svg className="h-5 w-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900">{activity.title}</p>
            <p className="text-sm text-gray-500">{activity.description}</p>
            <p className="text-xs text-gray-400">
              {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
} 