import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PrismaClient, Prisma } from "@prisma/client";
import SegmentSearch from "@/components/SegmentSearch";
import React from "react";

const prisma = new PrismaClient();

interface SegmentsPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function SegmentsPage({ searchParams }: SegmentsPageProps) {
  const session = await getServerSession();

  if (!session) {
    redirect("/auth/signin");
  }

  // Access searchParams as a plain object with proper type checking
  const pageParam = searchParams?.page;
  const searchParam = searchParams?.search;
  const sortParam = searchParams?.sort;

  const page = typeof pageParam === 'string' ? parseInt(pageParam) : 1;
  const limit = 10;
  const skip = (page - 1) * limit;
  const search = typeof searchParam === 'string' ? searchParam : '';
  const sort = typeof sortParam === 'string' ? sortParam : 'createdAt:desc';

  // Build the where clause for filtering
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  // Build the orderBy clause for sorting
  const [sortField, sortOrder] = sort.split(":");
  const orderBy: Prisma.SegmentOrderByWithRelationInput = {
    [sortField]: sortOrder || "desc",
  };

  const segments = await prisma.segment.findMany({
    where,
    orderBy,
    skip,
    take: limit,
  });

  // Get total count for pagination
  const total = await prisma.segment.count({ where });

  // For each segment, compute dynamic customer count
  const segmentCustomerCounts = await Promise.all(
    segments.map(async (segment) => {
      let customerWhere: any = null;
      const rules = segment.rules as any;
      if (rules && Object.keys(rules).length > 0) {
        customerWhere = {};
        if (rules.name) {
          customerWhere.name = { contains: rules.name };
        }
        if (rules.country) {
          customerWhere.country = rules.country;
        }
        if (rules.max_visits !== undefined) {
          customerWhere.visits = { lte: rules.max_visits };
        }
        if (rules.min_total_spent !== undefined) {
          customerWhere.total_spent = { gte: rules.min_total_spent };
        }
        if (rules.min_days_inactive !== undefined) {
          const minInactiveDate = new Date();
          minInactiveDate.setDate(minInactiveDate.getDate() - rules.min_days_inactive);
          customerWhere.last_active = { lte: minInactiveDate };
        }
      }
      if (customerWhere) {
        return await prisma.customer.count({ where: customerWhere });
      }
      return 0;
    })
  );

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 animate-fade-in">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 mb-6 text-blue-700 hover:text-blue-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-lg px-3 py-2 bg-white shadow-md hover:shadow-lg group"
          aria-label="Back to Dashboard"
        >
          <svg
            className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-semibold">Back to Dashboard</span>
        </Link>
      </div>
      <main className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between mb-6">
            <div className="flex-1 min-w-0">
              <h2 className="text-3xl font-extrabold leading-8 text-gray-900 tracking-tight mb-1 animate-fade-in-down">
                Customer Segments
              </h2>
              <p className="text-gray-500 text-sm animate-fade-in-down delay-100">Manage and organize your customer segments</p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <Link
                href="/dashboard/segments/new"
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                + Create Segment
              </Link>
            </div>
          </div>

          <div className="mt-8">
            <SegmentSearch />
          </div>

          <div className="mt-8 flex flex-col">
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden shadow-2xl ring-1 ring-black ring-opacity-5 md:rounded-3xl bg-white animate-fade-in-down">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-blue-50">
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-blue-900 sm:pl-6"
                        >
                          <Link
                            href={`/dashboard/segments?sort=name:${sortField === "name" && sortOrder === "asc" ? "desc" : "asc"}`}
                            className="group inline-flex items-center"
                          >
                            Name
                            <span className="ml-2 flex-none rounded text-blue-400 group-hover:visible group-focus:visible">
                              {sortField === "name" && sortOrder === "asc" ? "↑" : "↓"}
                            </span>
                          </Link>
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-blue-900"
                        >
                          Description
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-blue-900"
                        >
                          <Link
                            href={`/dashboard/segments?sort=customers:${sortField === "customers" && sortOrder === "asc" ? "desc" : "asc"}`}
                            className="group inline-flex items-center"
                          >
                            Customers
                            <span className="ml-2 flex-none rounded text-blue-400 group-hover:visible group-focus:visible">
                              {sortField === "customers" && sortOrder === "asc" ? "↑" : "↓"}
                            </span>
                          </Link>
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-blue-900"
                        >
                          <Link
                            href={`/dashboard/segments?sort=createdAt:${sortField === "createdAt" && sortOrder === "asc" ? "desc" : "asc"}`}
                            className="group inline-flex items-center"
                          >
                            Created
                            <span className="ml-2 flex-none rounded text-blue-400 group-hover:visible group-focus:visible">
                              {sortField === "createdAt" && sortOrder === "asc" ? "↑" : "↓"}
                            </span>
                          </Link>
                        </th>
                        <th
                          scope="col"
                          className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                        >
                          <span className="sr-only">View</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {segments.map((segment, idx) => (
                        <tr key={segment.id} className="transition-all duration-200 hover:bg-blue-50/70">
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {segment.name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {segment.description || "No description"}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {segmentCustomerCounts[idx]}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {new Date(segment.createdAt).toLocaleDateString()}
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <Link
                              href={`/dashboard/segments/${segment.id}`}
                              className="text-blue-600 hover:text-blue-900 transition-colors duration-200 underline underline-offset-2 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                      {segments.length === 0 && (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-3 py-4 text-sm text-gray-500 text-center"
                          >
                            No segments found. Create your first segment to get started.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <Link
                  href={`/dashboard/segments?page=${
                    page - 1
                  }&search=${search}&sort=${sort}`}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    page === 1 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  Previous
                </Link>
                <Link
                  href={`/dashboard/segments?page=${
                    page + 1
                  }&search=${search}&sort=${sort}`}
                  className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    page === totalPages ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  Next
                </Link>
              </div>
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
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 