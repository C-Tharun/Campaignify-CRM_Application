"use client";

import { useState } from "react";

export default function DataImport() {
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<"customers" | "orders">("customers");
  const [status, setStatus] = useState<{
    type: "success" | "error" | "loading" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setStatus({ type: "loading", message: "Uploading..." });

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`/api/${type}/import`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Import failed");
      }

      const data = await response.json();
      setStatus({
        type: "success",
        message: `Successfully imported ${data.count} ${type}`,
      });
      setFile(null);
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Import failed",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="type"
          className="block text-sm font-medium text-gray-700"
        >
          Data Type
        </label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value as "customers" | "orders")}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="customers">Customers</option>
          <option value="orders">Orders</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="file"
          className="block text-sm font-medium text-gray-700"
        >
          CSV File
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
              >
                <span>Upload a file</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  accept=".csv"
                  className="sr-only"
                  onChange={handleFileChange}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">CSV up to 10MB</p>
          </div>
        </div>
        {file && (
          <p className="mt-2 text-sm text-gray-500">
            Selected file: {file.name}
          </p>
        )}
      </div>

      {status.type && (
        <div
          className={`rounded-md p-4 ${
            status.type === "success"
              ? "bg-green-50"
              : status.type === "error"
              ? "bg-red-50"
              : "bg-blue-50"
          }`}
        >
          <p
            className={`text-sm ${
              status.type === "success"
                ? "text-green-800"
                : status.type === "error"
                ? "text-red-800"
                : "text-blue-800"
            }`}
          >
            {status.message}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={!file || status.type === "loading"}
        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
          !file || status.type === "loading"
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        }`}
      >
        {status.type === "loading" ? "Uploading..." : "Import Data"}
      </button>
    </form>
  );
} 