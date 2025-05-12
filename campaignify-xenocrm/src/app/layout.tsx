import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Campaignify - Xeno CRM Platform",
  description: "A modern CRM platform for customer segmentation and campaign management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="bg-red-500 text-white p-4 text-2xl">TAILWIND TEST</div>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
