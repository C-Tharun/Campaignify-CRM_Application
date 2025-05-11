"use client";

import React from "react";
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
      setFormData((prev) => ({
        ...prev,
        criteria: JSON.stringify(rules, null, 2),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsGeneratingRules(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10">
      {/* Back Button */}
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-2 mb-6 text-gray-600 hover:text-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-2 py-1 group"
        aria-label="Back"
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
        <span className="font-medium">Back</span>
      </button>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl rounded-2xl p-8 space-y-8 animate-fade-in"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {mode === "create" ? "Create New Segment" : "Edit Segment"}
        </h2>
        <p className="text-gray-500 mb-4">
          Define your customer segment using natural language or JSON criteria.
        </p>

        {error && (
          <div className="rounded-md bg-red-50 p-4 animate-fade-in-down">
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

        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-all duration-200"
            autoFocus
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            id="description"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-all duration-200"
          />
        </div>

        {/* AI Natural Language Input */}
        <div>
          <label htmlFor="naturalLanguage" className="block text-sm font-medium text-gray-700">
            Describe Your Segment (AI-Powered)
          </label>
          <textarea
            name="naturalLanguage"
            id="naturalLanguage"
            rows={3}
            value={naturalLanguage}
            onChange={(e) => setNaturalLanguage(e.target.value)}
            placeholder="e.g., Customers from India who have made at least 3 orders and spent over 5000 INR"
            className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-all duration-200"
          />
          <div className="mt-2">
            <button
              type="button"
              onClick={handleGenerateRules}
              disabled={isGeneratingRules}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50"
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

        {/* Criteria JSON */}
        <div>
          <label htmlFor="criteria" className="block text-sm font-medium text-gray-700">
            Segment Criteria (JSON)
          </label>
          <textarea
            name="criteria"
            id="criteria"
            rows={5}
            required
            value={formData.criteria}
            onChange={(e) => setFormData((prev) => ({ ...prev, criteria: e.target.value }))}
            className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-all duration-200 font-mono"
            placeholder='{"country": "US", "minOrders": 2}'
          />
          <p className="mt-2 text-sm text-gray-500">
            Enter the criteria in JSON format to define which customers belong to this segment.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center rounded-lg border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50"
          >
            {isSubmitting
              ? (
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
                  Saving...
                </span>
              )
              : mode === "create"
              ? "Create Segment"
              : "Update Segment"}
          </button>
        </div>
      </form>
    </div>
  );
}

// Tailwind animation utilities
// Add these to your global CSS if not present:
// .animate-fade-in { @apply opacity-0 animate-[fade-in_0.5s_ease-in-out_forwards]; }
// .animate-fade-in-down { @apply opacity-0 animate-[fade-in-down_0.5s_ease-in-out_forwards]; } 