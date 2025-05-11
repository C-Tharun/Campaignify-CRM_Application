import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PrismaClient } from "@prisma/client";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import DataImport from "@/components/forms/DataImport";
import RecentActivity from "@/components/ui/RecentActivity";

const prisma = new PrismaClient();

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/auth/signin");
  }

  const [campaigns, segments, customers] = await Promise.all([
    prisma.campaign.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        segment: true,
        _count: {
          select: { messages: true },
        },
      },
    }),
    prisma.segment.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { customerToSegments: true }, // Adjust to match the join table relation
        },
      },
    }),
    prisma.customer.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-black">Quick Actions</h3>
            <div className="flex flex-col space-y-3">
              <Link
                href="/dashboard/campaigns/new"
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create Campaign
              </Link>
              <Link
                href="/dashboard/segments/new"
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Create Segment
              </Link>
            </div>
          </div>
        </div>

        {/* Data Import */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col justify-between">
          <h3 className="text-lg font-semibold mb-4 text-black">Data Import</h3>
          <div className="flex-1 flex flex-col justify-center">
            <DataImport />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col justify-between">
          <h3 className="text-lg font-semibold mb-4 text-black">Recent Activity</h3>
          <div className="flex-1 flex flex-col justify-center">
            <RecentActivity />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}