import React from 'react';
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import BackButton from "@/components/ui/BackButton";

const prisma = new PrismaClient();

export default async function CustomerPage({ params }: { params: { id: string } }) {
  const session = await getServerSession();

  if (!session) {
    redirect("/auth/signin");
  }

  const customer = await prisma.customer.findUnique({
    where: {
      id: params.id,
    },
    include: {
      orders: {
        include: {
          items: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      customerToSegments: {
        include: {
          segment: true,
        },
      },
    },
  });

  if (!customer) {
    redirect("/dashboard/customers");
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              {customer.name}
            </h2>
            <p className="mt-1 text-sm text-gray-500">{customer.email}</p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <BackButton href="/dashboard/customers" />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Customer Details</h3>
              <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Country</dt>
                  <dd className="mt-1 text-sm text-gray-900">{customer.country}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Total Spent</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {customer.totalSpent.toLocaleString("en-US", {
                      style: "currency",
                      currency: customer.orders[0]?.currency || "USD",
                    })}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Visit Count</dt>
                  <dd className="mt-1 text-sm text-gray-900">{customer.visitCount}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Last Visit</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {customer.lastVisit
                      ? new Date(customer.lastVisit).toLocaleDateString()
                      : "Never"}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Segments</h3>
              <ul className="mt-5 divide-y divide-gray-200">
                {customer.customerToSegments.map(({ segment }) => (
                  <li key={segment.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {segment.name}
                        </p>
                        {segment.description && (
                          <p className="text-sm text-gray-500 truncate">
                            {segment.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Order History</h3>
              <div className="mt-5">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Order ID
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Date
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Amount
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {customer.orders.map((order) => (
                        <tr key={order.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {order.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.total.toLocaleString("en-US", {
                              style: "currency",
                              currency: order.currency,
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.status}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 