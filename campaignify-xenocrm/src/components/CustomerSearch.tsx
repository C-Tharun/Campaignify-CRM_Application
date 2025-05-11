"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { useDebounce } from "use-debounce";

interface CustomerSearchProps {
  segments: {
    id: string;
    name: string;
  }[];
}

export default function CustomerSearch({ segments }: CustomerSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  const handleSearch = useCallback(
    (term: string) => {
      startTransition(() => {
        router.push(
          `/dashboard/customers?${createQueryString("search", term)}`
        );
      });
    },
    [createQueryString, router]
  );

  const handleSegmentChange = useCallback(
    (segmentId: string) => {
      startTransition(() => {
        router.push(
          `/dashboard/customers?${createQueryString("segment", segmentId)}`
        );
      });
    },
    [createQueryString, router]
  );

  const [debouncedSearch] = useDebounce(handleSearch, 300);

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700"
            >
              Search Customers
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="search"
                id="search"
                defaultValue={searchParams.get("search") || ""}
                onChange={(e) => debouncedSearch(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Search by name, email, or phone..."
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="segment"
              className="block text-sm font-medium text-gray-700"
            >
              Filter by Segment
            </label>
            <div className="mt-1">
              <select
                id="segment"
                name="segment"
                defaultValue={searchParams.get("segment") || ""}
                onChange={(e) => handleSegmentChange(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">All Segments</option>
                {segments.map((segment) => (
                  <option key={segment.id} value={segment.id}>
                    {segment.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 