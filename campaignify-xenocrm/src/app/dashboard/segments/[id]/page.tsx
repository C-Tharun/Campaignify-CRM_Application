import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import React from "react";
import SegmentForm from "@/components/forms/SegmentForm";

const prisma = new PrismaClient();

interface SegmentPageProps {
  params: {
    id: string;
  };
}

export default async function SegmentPage({ params }: SegmentPageProps) {
  const session = await getServerSession();

  if (!session) {
    redirect("/auth/signin");
  }

  // Ensure params.id is a string
  const segmentId = params.id;

  if (!segmentId) {
    redirect("/dashboard/segments");
  }

  const segment = await prisma.segment.findUnique({
    where: {
      id: segmentId,
    },
  });

  if (!segment) {
    redirect("/dashboard/segments");
  }

  // Parse rules and build dynamic where clause
  const rules = segment.rules as any;
  let customerWhere: any = null;

  if (rules && Object.keys(rules).length > 0) {
    // Support both old and new (AI-generated) rule formats
    if (rules.rule && rules.rule.condition) {
      const cond = rules.rule.condition;
      customerWhere = {};
      if (cond.customer_country) {
        customerWhere.country = cond.customer_country;
      }
      if (cond.total_spent && cond.total_spent.greater_than !== undefined) {
        customerWhere.totalSpent = { gt: cond.total_spent.greater_than };
      }
      if (cond.customer_visits && cond.customer_visits.greater_than !== undefined) {
        customerWhere.visitCount = { gt: cond.customer_visits.greater_than };
      }
      // Add more mappings as needed for other AI rule keys
    } else {
      // Legacy/flat rules
      customerWhere = {};
      if (rules.name) {
        customerWhere.name = { contains: rules.name };
      }
      if (rules.country) {
        customerWhere.country = rules.country;
      }
      if (rules.max_visits !== undefined) {
        customerWhere.visitCount = { lte: rules.max_visits };
      }
      if (rules.min_total_spent !== undefined) {
        customerWhere.totalSpent = { gte: rules.min_total_spent };
      }
      if (rules.min_days_inactive !== undefined) {
        const minInactiveDate = new Date();
        minInactiveDate.setDate(minInactiveDate.getDate() - rules.min_days_inactive);
        customerWhere.last_active = { lte: minInactiveDate };
      }
    }
  }

  // If no rules, return no customers
  let customers: any[] = [];
  if (customerWhere) {
    customers = await prisma.customer.findMany({
      where: customerWhere,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 animate-fade-in">
      {/* Top Back Button */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex items-center">
        <Link
          href="/dashboard/segments"
          className="flex items-center gap-2 mb-6 text-blue-700 hover:text-blue-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-lg px-3 py-2 bg-white shadow-md hover:shadow-lg group"
          aria-label="Back to Segments"
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
          <span className="font-semibold">Back to Segments</span>
        </Link>
      </div>
      <main className="py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-3xl font-extrabold leading-8 text-gray-900 tracking-tight mb-1 animate-fade-in-down">
                {segment.name}
              </h2>
              <p className="text-gray-500 text-sm animate-fade-in-down delay-100">Segment Details & Customer List</p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Segment Information */}
            <div className="bg-white shadow-2xl rounded-3xl animate-fade-in-down transition-all duration-500 border border-blue-100">
              <div className="px-8 py-8">
                <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20.5C7.305 20.5 3.5 16.695 3.5 12S7.305 3.5 12 3.5 20.5 7.305 20.5 12 16.695 20.5 12 20.5z" /></svg>
                  Segment Information
                </h3>
                <div className="border-t border-gray-200 pt-4">
                  <dl className="divide-y divide-gray-100">
                    <div className="py-4 grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-gray-500">Description</dt>
                      <dd className="col-span-2 text-sm text-gray-900">{segment.description || "No description"}</dd>
                    </div>
                    <div className="py-4 grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-gray-500">Created At</dt>
                      <dd className="col-span-2 text-sm text-gray-900">{new Date(segment.createdAt).toLocaleDateString()}</dd>
                    </div>
                    <div className="py-4 grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-gray-500">Total Customers</dt>
                      <dd className="col-span-2 text-sm text-gray-900">{customers.length}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>

            {/* Segment Criteria */}
            <div className="bg-white shadow-2xl rounded-3xl animate-fade-in-down transition-all duration-500 border border-blue-100">
              <div className="px-8 py-8">
                <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 01-8 0" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v4m0 0a4 4 0 01-4 4H7a4 4 0 01-4-4V7a4 4 0 014-4h1a4 4 0 014 4z" /></svg>
                  Segment Criteria
                </h3>
                <div className="mt-2">
                  <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm text-gray-900 font-mono border border-gray-100 animate-fade-in-up">
                    {JSON.stringify(segment.rules, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Segment Customers */}
          <div className="mt-10">
            <div className="bg-white shadow-2xl rounded-3xl animate-fade-in-up transition-all duration-500 border border-blue-100">
              <div className="px-8 py-8">
                <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M16 3.13a4 4 0 010 7.75M8 3.13a4 4 0 000 7.75" /></svg>
                  Customers in Segment
                </h3>
                <div className="mt-2">
                  {customers.length > 0 ? (
                    <div className="overflow-x-auto animate-fade-in-up">
                      <table className="min-w-full divide-y divide-gray-200 rounded-xl overflow-hidden bg-white">
                        <thead className="bg-blue-50">
                          <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-blue-900 sm:pl-6">Name</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-blue-900">Email</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-blue-900">Country</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-blue-900">Total Spent</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-blue-900">Visit Count</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-blue-900">Phone</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-blue-900">Orders</th>
                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">View</span></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {customers.map((customer) => (
                            <tr key={customer.id} className="transition-all duration-200 hover:bg-blue-50/70">
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{customer.name}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{customer.email}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{customer.country}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">${customer.totalSpent.toFixed(2)}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{customer.visitCount}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{customer.phone}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{customer._count.orders}</td>
                              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                <Link
                                  href={`/dashboard/customers/${customer.id}`}
                                  className="text-blue-600 hover:text-blue-900 transition-colors duration-200 underline underline-offset-2 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
                                >
                                  View
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 animate-fade-in-up">No customers in this segment.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Back Button */}
          <div className="flex justify-center mt-12 animate-fade-in-up">
            <Link
              href="/dashboard/segments"
              className="flex items-center gap-2 text-blue-700 hover:text-blue-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-lg px-4 py-2 bg-white shadow-md hover:shadow-lg group"
              aria-label="Back to Segments"
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
              <span className="font-semibold">Back to Segments</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
} 