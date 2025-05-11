import { PrismaClient, CampaignStatus } from "@prisma/client";
import { MessageService } from "./messageService";

const prisma = new PrismaClient();

export class CampaignService {
  // Execute a campaign
  static async executeCampaign(campaignId: string) {
    try {
      // Get campaign with segment and customers
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

      // Update campaign status to SENDING
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { status: CampaignStatus.SENDING },
      });

      // Send messages to all customers in the segment
      const messagePromises = campaign.segment.customers.map((customer) =>
        MessageService.sendMessage(
          campaignId,
          customer.id,
          `Hi ${customer.name}, here's 10% off on your next order!`
        )
      );

      await Promise.all(messagePromises);

      // Update campaign status to COMPLETED
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { status: CampaignStatus.COMPLETED },
      });

      return campaign;
    } catch (error) {
      // Update campaign status to FAILED if there's an error
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { status: CampaignStatus.FAILED },
      });

      console.error("Error executing campaign:", error);
      throw error;
    }
  }

  // Get campaign statistics
  static async getCampaignStats(campaignId: string) {
    const campaign = await prisma.campaign.findUnique({
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
    });

    if (!campaign) {
      throw new Error("Campaign not found");
    }

    const messageStats = await MessageService.getCampaignStats(campaignId);

    return {
      campaign,
      audienceSize: campaign.segment._count.customers,
      messageStats,
    };
  }
} 