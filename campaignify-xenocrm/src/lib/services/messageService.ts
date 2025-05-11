import { prisma } from "@/lib/prisma";
import { MessageStatus } from "@prisma/client";

interface MessageData {
  campaignId: string;
  customerId: string;
  content: string;
}

// Dummy vendor API simulation
async function dummyVendorAPI(customer: any, content: string): Promise<{ success: boolean; error?: string }> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // 90% success rate
  const success = Math.random() < 0.9;
  
  if (!success) {
    return {
      success: false,
      error: "Vendor API: Message delivery failed"
    };
  }

  return { success: true };
}

// Delivery Receipt API
async function updateDeliveryStatus(messageId: string, status: MessageStatus, error?: string) {
  await prisma.message.update({
    where: { id: messageId },
    data: {
      status,
      deliveredAt: status === MessageStatus.DELIVERED ? new Date() : null,
      failedAt: status === MessageStatus.FAILED ? new Date() : null,
      error: status === MessageStatus.FAILED ? error : null,
    },
  });
}

export class MessageService {
  static async sendMessage(data: MessageData) {
    try {
      // Get customer details
      const customer = await prisma.customer.findUnique({
        where: { id: data.customerId },
      });

      if (!customer) {
        throw new Error("Customer not found");
      }

      // Create message record
      const message = await prisma.message.create({
        data: {
          campaignId: data.campaignId,
          customerId: data.customerId,
          content: data.content,
          status: MessageStatus.PENDING,
        },
      });

      try {
        // Call dummy vendor API
        console.log(`Sending message to ${customer.email}: ${data.content}`);
        const result = await dummyVendorAPI(customer, data.content);
        
        // Update message status based on vendor API response
        if (result.success) {
          await updateDeliveryStatus(message.id, MessageStatus.DELIVERED);
        } else {
          await updateDeliveryStatus(message.id, MessageStatus.FAILED, result.error);
        }

        return message;
      } catch (error) {
        // Update message status to failed
        await updateDeliveryStatus(
          message.id,
          MessageStatus.FAILED,
          error instanceof Error ? error.message : "Failed to send message"
        );
        throw error;
      }
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  static async getMessageStatus(messageId: string) {
    return prisma.message.findUnique({
      where: { id: messageId },
      select: {
        id: true,
        status: true,
        sentAt: true,
        deliveredAt: true,
        failedAt: true,
        error: true,
      },
    });
  }

  static async getCampaignMessages(campaignId: string) {
    return prisma.message.findMany({
      where: { campaignId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getMessageStats(campaignId: string) {
    const messages = await prisma.message.groupBy({
      by: ["status"],
      where: { campaignId },
      _count: true,
    });

    return messages.reduce(
      (stats, { status, _count }) => ({
        ...stats,
        [status.toLowerCase()]: _count,
      }),
      {
        pending: 0,
        delivered: 0,
        failed: 0,
      }
    );
  }
} 