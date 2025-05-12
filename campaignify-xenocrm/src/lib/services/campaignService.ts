import { CampaignStatus } from "@prisma/client";
import { MessageService } from "./messageService";
import axios from "axios";
import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/db";

export class CampaignService {
  static async executeCampaign(campaignId: string) {
    try {
      // Get campaign and its segment with retry
      const campaign = await withRetry(() =>
        prisma.campaign.findUnique({
          where: { id: campaignId },
          include: {
            segment: true,
          },
        })
      );

      if (!campaign) {
        throw new Error("Campaign not found");
      }

      if (campaign.status !== CampaignStatus.SCHEDULED) {
        throw new Error("Campaign is not in scheduled state");
      }

      // Update campaign status to sending with retry
      await withRetry(() =>
        prisma.campaign.update({
          where: { id: campaignId },
          data: { status: CampaignStatus.SENDING },
        })
      );

      // Calculate customer query based on segment rules
      let customerWhere: any = null;
      const rules = campaign.segment.rules as any;
      if (rules && Object.keys(rules).length > 0) {
        customerWhere = {};
        if (rules.name) {
          customerWhere.name = { contains: rules.name };
        }
        if (rules.country) {
          customerWhere.country = rules.country;
        }
        if (rules.max_visits !== undefined) {
          customerWhere.visits = { lte: rules.max_visits };
        }
        if (rules.min_total_spent !== undefined) {
          customerWhere.total_spent = { gte: rules.min_total_spent };
        }
        if (rules.min_days_inactive !== undefined) {
          const minInactiveDate = new Date();
          minInactiveDate.setDate(minInactiveDate.getDate() - rules.min_days_inactive);
          customerWhere.last_active = { lte: minInactiveDate };
        }
      }

      // Get customers based on segment rules with retry
      const customers = await withRetry(() =>
        prisma.customer.findMany({
          where: customerWhere,
        })
      );

      // Helper to get AI-personalized message
      async function getAIPersonalizedMessage(customer: any, campaign: any) {
        try {
          const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
              model: "mistralai/mistral-7b-instruct",
              messages: [
                { role: "system", content: "You are a marketing assistant that writes short, friendly, personalized campaign messages for customers." },
                { role: "user", content: `Write a personalized marketing message for ${customer.name} based on this campaign objective: \"${campaign.description}\".` }
              ],
              max_tokens: 80,
              temperature: 0.7
            },
            {
              headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "Xeno CRM AI"
              },
            }
          );
          return response.data.choices[0]?.message?.content || `Hi ${customer.name}, ${campaign.description}`;
        } catch (e) {
          return `Hi ${customer.name}, ${campaign.description}`;
        }
      }

      // Send AI-personalized messages to all customers in the segment
      const messagePromises = customers.map(async (customer) => {
        const aiMessage = await getAIPersonalizedMessage(customer, campaign);
        return MessageService.sendMessage({
          campaignId,
          customerId: customer.id,
          content: aiMessage,
        });
      });

      await Promise.all(messagePromises);

      // Update campaign status to completed with retry
      await withRetry(() =>
        prisma.campaign.update({
          where: { id: campaignId },
          data: { status: CampaignStatus.COMPLETED },
        })
      );

      return campaign;
    } catch (error) {
      // Update campaign status to failed with retry
      await withRetry(() =>
        prisma.campaign.update({
          where: { id: campaignId },
          data: {
            status: CampaignStatus.FAILED,
          },
        })
      );

      throw error;
    }
  }

  static async getCampaignStats(campaignId: string) {
    const [campaign, messageStats] = await Promise.all([
      withRetry(() =>
        prisma.campaign.findUnique({
          where: { id: campaignId },
          include: {
            segment: true,
          },
        })
      ),
      MessageService.getMessageStats(campaignId),
    ]);

    if (!campaign) {
      throw new Error("Campaign not found");
    }

    // Calculate dynamic audience size based on segment rules
    let customerWhere: any = null;
    const rules = campaign.segment.rules as any;
    if (rules && Object.keys(rules).length > 0) {
      customerWhere = {};
      if (rules.name) {
        customerWhere.name = { contains: rules.name };
      }
      if (rules.country) {
        customerWhere.country = rules.country;
      }
      if (rules.max_visits !== undefined) {
        customerWhere.visits = { lte: rules.max_visits };
      }
      if (rules.min_total_spent !== undefined) {
        customerWhere.total_spent = { gte: rules.min_total_spent };
      }
      if (rules.min_days_inactive !== undefined) {
        const minInactiveDate = new Date();
        minInactiveDate.setDate(minInactiveDate.getDate() - rules.min_days_inactive);
        customerWhere.last_active = { lte: minInactiveDate };
      }
    }

    let totalCustomers = 0;
    if (customerWhere) {
      totalCustomers = await withRetry(() =>
        prisma.customer.count({ where: customerWhere })
      );
    }

    return {
      campaign,
      stats: {
        totalCustomers,
        ...messageStats,
      },
    };
  }

  static async scheduleCampaign(campaignId: string, scheduledFor: Date) {
    // Update campaign status with retry
    const campaign = await withRetry(() =>
      prisma.campaign.update({
        where: { id: campaignId },
        data: {
          status: CampaignStatus.SCHEDULED,
        },
      })
    );

    // Schedule the campaign execution
    setTimeout(() => {
      this.executeCampaign(campaignId).catch(console.error);
    }, scheduledFor.getTime() - Date.now());

    return campaign;
  }
} 