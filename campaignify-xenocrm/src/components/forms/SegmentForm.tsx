"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SegmentFormProps {
  initialData?: {
    name: string;
    description: string;
    criteria: string;
  };
  mode: "create" | "edit";
  segmentId?: string;
}

export default function SegmentForm({
  initialData,
  mode,
  segmentId,
}: SegmentFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [naturalLanguage, setNaturalLanguage] = useState("");
  const [isGeneratingRules, setIsGeneratingRules] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    criteria: initialData?.criteria || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const url = mode === "create" ? "/api/segments" : `/api/segments/${segmentId}`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to save segment");
      }

      router.push("/dashboard/segments");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateRules = async () => {
    if (!naturalLanguage.trim()) {
      setError("Please enter a description of your segment");
      return;
    }

    setIsGeneratingRules(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/natural-language-to-rules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ naturalLanguage }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate rules");
      }

      const rules = await response.json();
      
      // Ensure the rules are properly formatted
      const formattedRules = {
        ...rules,
        // Convert inactiveDays to number if it exists
        inactiveDays: rules.inactiveDays ? Number(rules.inactiveDays) : undefined
      };

      setFormData((prev) => ({
        ...prev,
        criteria: JSON.stringify(formattedRules, null, 2),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsGeneratingRules(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error saving segment
              </h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-black"
        >
          Name
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="name"
            id="name"
            required
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            className="block w-full rounded-md border-blue-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-black bg-white px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-black"
        >
          Description
        </label>
        <div className="mt-1">
          <textarea
            name="description"
            id="description"
            rows={3}
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            className="block w-full rounded-md border-blue-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-black bg-white px-3 py-2"
          />
        </div>
      </div>

      {/* AI Natural Language Input */}
      <div>
        <label
          htmlFor="naturalLanguage"
          className="block text-sm font-medium text-black"
        >
          Describe Your Segment (AI-Powered)
        </label>
        <div className="mt-1">
          <textarea
            name="naturalLanguage"
            id="naturalLanguage"
            rows={3}
            value={naturalLanguage}
            onChange={(e) => setNaturalLanguage(e.target.value)}
            placeholder="e.g., Customers from India who have made at least 3 orders and spent over 5000 INR"
            className="block w-full rounded-md border-blue-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-black bg-white px-3 py-2"
          />
        </div>
        <div className="mt-2">
          <button
            type="button"
            onClick={handleGenerateRules}
            disabled={isGeneratingRules}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isGeneratingRules ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                Generating...
              </span>
            ) : (
              "Generate Rules"
            )}
          </button>
        </div>
      </div>

      <div>
        <label
          htmlFor="criteria"
          className="block text-sm font-medium text-black"
        >
          Segment Criteria (JSON)
        </label>
        <div className="mt-1">
          <textarea
            name="criteria"
            id="criteria"
            rows={5}
            required
            value={formData.criteria}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, criteria: e.target.value }))
            }
            className="block w-full rounded-md border-blue-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm font-mono text-black bg-white px-3 py-2"
            placeholder='{"country": "US", "minOrders": 2}'
          />
        </div>
        <p className="mt-2 text-sm text-blue-900">
          Enter the criteria in JSON format to define which customers belong to this segment.
        </p>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex justify-center rounded-md border border-blue-500 bg-white px-4 py-2 text-sm font-medium text-blue-700 shadow-sm hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : mode === "create" ? "Create Segment" : "Save Changes"}
        </button>
      </div>
    </form>
  );
} 