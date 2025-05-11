import { PrismaClient, CampaignStatus } from "@prisma/client";
import { MessageService } from "./messageService";

const prisma = new PrismaClient();

export class CampaignService {
  static async executeCampaign(campaignId: string) {
    try {
      // Get campaign and its segment
      const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
        include: {
          segment: {
            include: {
              customers: true,
            },
          },
        },
      });

      if (!campaign) {
        throw new Error("Campaign not found");
      }

      if (campaign.status !== CampaignStatus.SCHEDULED) {
        throw new Error("Campaign is not in scheduled state");
      }

      // Update campaign status to sending
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { status: CampaignStatus.SENDING },
      });

      // Send messages to all customers in the segment
      const messagePromises = campaign.segment.customers.map((customer) =>
        MessageService.sendMessage({
          campaignId,
          customerId: customer.id,
          content: `Hi ${customer.name}, here's a special offer just for you!`, // Use a default message
          type: "EMAIL", // Default to email for now
        })
      );

      await Promise.all(messagePromises);

      // Update campaign status to completed
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { status: CampaignStatus.COMPLETED },
      });

      return campaign;
    } catch (error) {
      // Update campaign status to failed
      await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          status: CampaignStatus.FAILED,
        },
      });

      throw error;
    }
  }

  static async getCampaignStats(campaignId: string) {
    const [campaign, messageStats] = await Promise.all([
      prisma.campaign.findUnique({
        where: { id: campaignId },
        include: {
          segment: {
            include: {
              _count: {
                select: { customers: true },
              },
            },
          },
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.message.groupBy({
        by: ["status"],
        where: { campaignId },
        _count: true,
      }),
    ]);

    if (!campaign) {
      throw new Error("Campaign not found");
    }

    // Calculate message stats
    const stats = {
      total: messageStats.reduce((acc, curr) => acc + curr._count, 0),
      delivered: messageStats.find((s) => s.status === "DELIVERED")?._count || 0,
      failed: messageStats.find((s) => s.status === "FAILED")?._count || 0,
      pending: messageStats.find((s) => s.status === "PENDING")?._count || 0,
      totalCustomers: campaign.segment._count.customers,
    };

    // Format dates
    const formattedCampaign = {
      ...campaign,
      createdAt: campaign.createdAt.toLocaleString(),
    };

    return {
      campaign: formattedCampaign,
      stats,
    };
  }
} 