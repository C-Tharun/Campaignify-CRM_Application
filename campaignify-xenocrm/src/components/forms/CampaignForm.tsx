"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { CampaignStatus } from "@prisma/client";

const campaignSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  segmentId: z.string().min(1, "Segment is required"),
  status: z.nativeEnum(CampaignStatus),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

interface Segment {
  id: string;
  name: string;
}

interface CampaignFormProps {
  segments: Segment[];
  initialData?: Partial<CampaignFormData>;
}

export function CampaignForm({ segments, initialData }: CampaignFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      ...initialData,
      status: initialData?.status || CampaignStatus.DRAFT,
    },
  });

  const onSubmit = async (data: CampaignFormData) => {
    try {
      const response = await fetch("/api/campaigns", {
        method: initialData ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to save campaign");
      }

      router.push("/dashboard/campaigns");
      router.refresh();
    } catch (err) {
      console.error("Failed to save campaign:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          {...register("name")}
          placeholder="Campaign Name"
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <Textarea
          {...register("description")}
          placeholder="Campaign Description"
          className={errors.description ? "border-red-500" : ""}
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
        )}
      </div>

      <div>
        <Select
          {...register("segmentId")}
          className={errors.segmentId ? "border-red-500" : ""}
        >
          <option value="">Select a Segment</option>
          {segments.map((segment) => (
            <option key={segment.id} value={segment.id}>
              {segment.name}
            </option>
          ))}
        </Select>
        {errors.segmentId && (
          <p className="text-red-500 text-sm mt-1">{errors.segmentId.message}</p>
        )}
      </div>

      <div>
        <Select
          {...register("status")}
          className={errors.status ? "border-red-500" : ""}
        >
          {Object.values(CampaignStatus).map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </Select>
        {errors.status && (
          <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : initialData ? "Update Campaign" : "Create Campaign"}
        </Button>
      </div>
    </form>
  );
} 