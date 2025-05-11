import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import SegmentForm from "@/components/forms/SegmentForm";

export default async function NewSegmentPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6 text-gray-900">Create New Segment</h1>
          <SegmentForm mode="create" />
        </div>
      </div>
    </div>
  );
} 