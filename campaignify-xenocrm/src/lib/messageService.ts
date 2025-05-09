import { PrismaClient, MessageStatus } from "@prisma/client";

const prisma = new PrismaClient();

interface MessageData {
  campaignId: string;
  customerId: string;
  content: string;
  type: "EMAIL" | "SMS";
}

export class MessageService {
  static async sendMessage(data: MessageData) {
    try {
      // Create message record
      const message = await prisma.message.create({
        data: {
          campaignId: data.campaignId,
          customerId: data.customerId,
          content: data.content,
          type: data.type,
          status: MessageStatus.PENDING,
        },
      });

      // Simulate sending message (replace with actual email/SMS service integration)
      await this.simulateMessageDelivery(message.id);

      return message;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  private static async simulateMessageDelivery(messageId: string) {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Randomly succeed or fail (for testing)
    const success = Math.random() > 0.1; // 90% success rate

    await prisma.message.update({
      where: { id: messageId },
      data: {
        status: success ? MessageStatus.DELIVERED : MessageStatus.FAILED,
        deliveredAt: success ? new Date() : null,
        error: success ? null : "Simulated delivery failure",
      },
    });
  }

  static async getMessageStatus(messageId: string) {
    return prisma.message.findUnique({
      where: { id: messageId },
      select: {
        id: true,
        status: true,
        deliveredAt: true,
        error: true,
      },
    });
  }

  static async getCampaignMessages(campaignId: string) {
    return prisma.message.findMany({
      where: { campaignId },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
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