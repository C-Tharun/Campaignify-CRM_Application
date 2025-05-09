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
          content: campaign.content,
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
          error: error instanceof Error ? error.message : "Unknown error",
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
        },
      }),
      MessageService.getMessageStats(campaignId),
    ]);

    if (!campaign) {
      throw new Error("Campaign not found");
    }

    return {
      campaign,
      stats: {
        totalCustomers: campaign.segment._count.customers,
        ...messageStats,
      },
    };
  }

  static async scheduleCampaign(campaignId: string, scheduledFor: Date) {
    const campaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: CampaignStatus.SCHEDULED,
        scheduledFor,
      },
    });

    // Schedule the campaign execution
    setTimeout(() => {
      this.executeCampaign(campaignId).catch(console.error);
    }, scheduledFor.getTime() - Date.now());

    return campaign;
  }
} 