import React from 'react';
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PrismaClient, Prisma } from "@prisma/client";
import SegmentSearch from "@/components/ui/SegmentSearch";

const prisma = new PrismaClient();

interface SegmentsPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function SegmentsPage({ searchParams }: SegmentsPageProps) {
  const session = await getServerSession();

  if (!session) {
    redirect("/auth/signin");
  }

  const search = (searchParams.search as string) || "";
  const page = Number(searchParams.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;
  const sort = (searchParams.sort as string) || "createdAt";

  const where: Prisma.SegmentWhereInput = {
    OR: [
      { name: { contains: search } },
      { description: { contains: search } },
    ],
  };

  const [segmentsQueryResult, allMatchingIdsForCount] = await Promise.all([
    prisma.segment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sort]: "desc" },
      include: {
        _count: {
          select: { customerToSegments: true },
        },
      },
    }),
    prisma.segment.findMany({
      where,
      select: { id: true } // Fetch only IDs for counting
    }),
  ]);

  const segments = segmentsQueryResult;
  const total = allMatchingIdsForCount.length;

  const totalPages = Math.ceil(total / limit);

  // Field mapping from snake_case to camelCase
  const fieldMap: Record<string, string> = {
    total_spent: "totalSpent",
    customer_spending: "totalSpent",
    visit_count: "visitCount",
    last_visit: "lastVisit",
    country: "country",
    name: "name",
    email: "email",
    "orders.count": "orders.count",
    // add more as needed
  };

  // Helper to count customers for a segment
  async function getDynamicCustomerCount(segment: any) {
    const rules = segment.rules as any;
    let customerWhere: any = null;
    let orderCountRule: any = null;
    if (rules && Object.keys(rules).length > 0) {
      if (Array.isArray(rules.rules)) {
        // Flatten rules: if a rule has 'action' and/or 'condition', treat each as a separate rule
        const flatRules = [];
        for (const rule of rules.rules) {
          if (rule.action) flatRules.push(rule.action);
          if (rule.condition) flatRules.push(rule.condition);
          if (!rule.action && !rule.condition) flatRules.push(rule);
        }
        customerWhere = {};
        for (const rule of flatRules) {
          if (!rule.field || rule.value === undefined) continue;
          const prismaField = fieldMap[rule.field] || rule.field;
          if (prismaField === "orders.count") {
            orderCountRule = { ...rule, field: prismaField };
            continue;
          }
          switch (rule.operator) {
            case "equals":
              customerWhere[prismaField] = rule.value;
              break;
            case "greaterThan":
              customerWhere[prismaField] = { gt: rule.value };
              break;
            case "greaterThanOrEqual":
              customerWhere[prismaField] = { gte: rule.value };
              break;
            case "lessThan":
              customerWhere[prismaField] = { lt: rule.value };
              break;
            case "lessThanOrEqual":
              customerWhere[prismaField] = { lte: rule.value };
              break;
            case "contains":
              customerWhere[prismaField] = { contains: rule.value };
              break;
            default:
              customerWhere[prismaField] = rule.value;
          }
        }
      }
    }
    if (customerWhere) {
      if (orderCountRule) {
        // Use raw SQL to get customer IDs with order count filter (MySQL)
        let sqlOp = '>=';
        switch (orderCountRule.operator) {
          case 'equals': sqlOp = '='; break;
          case 'greaterThan': sqlOp = '>' ; break;
          case 'greaterThanOrEqual': sqlOp = '>='; break;
          case 'lessThan': sqlOp = '<'; break;
          case 'lessThanOrEqual': sqlOp = '<='; break;
        }
        const minOrderCount = orderCountRule.value;
        const customerIdsWithMinOrders = await prisma.$queryRawUnsafe(
          `SELECT customerId FROM \`Order\` GROUP BY customerId HAVING COUNT(*) ${sqlOp} ?`,
          minOrderCount
        );
        const matchingIds = (customerIdsWithMinOrders as any[]).map((row: any) => row.customerId);
        if (matchingIds.length === 0) {
          return 0;
        } else {
          return await prisma.customer.count({
            where: { ...customerWhere, id: { in: matchingIds } },
          });
        }
      } else {
        return await prisma.customer.count({ where: customerWhere });
      }
    }
    return 0;
  }

  // Get dynamic customer counts for all segments
  const dynamicCustomerCounts = await Promise.all(
    segments.map(segment => getDynamicCustomerCount(segment))
  );

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Segments
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link
            href="/dashboard/segments/new"
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Create Segment
          </Link>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="mb-4">
          <SegmentSearch />
        </div>

        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Description
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Customers
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {segments.map((segment, idx) => (
                    <tr key={segment.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {segment.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {segment.description || "No description"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {dynamicCustomerCounts[idx]}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <Link
                          href={`/dashboard/segments/${segment.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {total > limit && (
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">
                  {skip + 1}-{Math.min(skip + limit, total)}
                </span>{" "}
                of <span className="font-medium">{total}</span> results
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (pageNum) => (
                    <Link
                      key={pageNum}
                      href={`/dashboard/segments?page=${pageNum}&search=${search}&sort=${sort}`}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pageNum === page
                          ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      } focus:outline-none focus:ring-2 focus:ring-blue-400`}
                    >
                      {pageNum}
                    </Link>
                  )
                )}
              </nav>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 