import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { authOptions } from "@/lib/auth";

export default async function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  return <DashboardLayout>{children}</DashboardLayout>;
} 