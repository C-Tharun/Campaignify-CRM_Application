import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import Link from "next/link";

const prisma = new PrismaClient();

interface CustomerPageProps {
  params: {
    id: string;
  };
}

export default async function CustomerPage({ params }: CustomerPageProps) {
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
        orderBy: {
          createdAt: "desc",
        },
      },
      customerToSegments: {
        include: {
          segment: true, // Fetch related segments through the join table
        },
      },
    },
  });

  if (!customer) {
    redirect("/dashboard/customers");
  }

  // Fetch all segments for dynamic membership calculation
  const allSegments = await prisma.segment.findMany();
  // Helper to check if a customer matches a segment's rules
  function matchesSegmentRules(rules: any, customer: any) {
    if (!rules || Object.keys(rules).length === 0) return false;
    // AI-generated nested rules
    if (rules.rule && rules.rule.condition) {
      const cond = rules.rule.condition;
      if (cond.customer_country && customer.country !== cond.customer_country) return false;
      if (cond.total_spent && cond.total_spent.greater_than !== undefined && !(customer.totalSpent > cond.total_spent.greater_than)) return false;
      if (cond.customer_visits && cond.customer_visits.greater_than !== undefined && !(customer.visitCount > cond.customer_visits.greater_than)) return false;
      // Add more mappings as needed
      return true;
    } else {
      // Legacy/flat rules
      if (rules.country && customer.country !== rules.country) return false;
      if (rules.min_total_spent !== undefined && !(customer.totalSpent >= rules.min_total_spent)) return false;
      if (rules.max_visits !== undefined && !(customer.visitCount <= rules.max_visits)) return false;
      // Add more mappings as needed
      return true;
    }
  }
  const dynamicSegments = allSegments.filter(seg => matchesSegmentRules(seg.rules, customer));

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                {customer.name}
              </h2>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <Link
                href="/dashboard/customers"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Customers
              </Link>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Customer Information */}
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Customer Information
                </h3>
                <div className="mt-5 border-t border-gray-200">
                  <dl className="divide-y divide-gray-200">
                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {customer.email}
                      </dd>
                    </div>
                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-500">Phone</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                
                      </dd>
                    </div>
                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-500">
                        Created At
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>

            {/* Customer Segments */}
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Customer Segments
                </h3>
                <div className="mt-5">
                  {dynamicSegments.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                      {dynamicSegments.map((segment) => (
                        <li
                          key={segment.id}
                          className="py-4 flex items-center justify-between"
                        >
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-gray-900">
                              {segment.name}
                            </p>
                          </div>
                          <Link
                            href={`/dashboard/segments/${segment.id}`}
                            className="text-sm text-blue-600 hover:text-blue-900"
                          >
                            View Segment
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">
                      This customer is not part of any segments.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Customer Orders */}
          <div className="mt-8">
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Order History
                </h3>
                <div className="mt-5">
                  {customer.orders.length > 0 ? (
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                            >
                              Order ID
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                            >
                              Amount
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                            >
                              Status
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                            >
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {customer.orders.map((order) => (
                            <tr key={order.id}>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                {order.id}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                ${order.amount.toFixed(2)}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {order.status}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      This customer has no orders.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}