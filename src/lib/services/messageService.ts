import { PrismaClient, MessageStatus } from "@prisma/client";

const prisma = new PrismaClient();

export class MessageService {
  // Simulate sending a message to a customer
  static async sendMessage(campaignId: string, customerId: string, content: string) {
    try {
      // Create message record
      const message = await prisma.message.create({
        data: {
          campaignId,
          customerId,
          content,
          status: MessageStatus.PENDING,
        },
      });

      // Simulate vendor API call with 90% success rate
      const isSuccess = Math.random() < 0.9;
      
      if (isSuccess) {
        // Simulate successful delivery
        await this.updateMessageStatus(message.id, MessageStatus.SENT);
        // Simulate delivery receipt after a short delay
        setTimeout(() => {
          this.updateMessageStatus(message.id, MessageStatus.DELIVERED);
        }, 1000);
      } else {
        // Simulate failed delivery
        await this.updateMessageStatus(message.id, MessageStatus.FAILED, "Simulated delivery failure");
      }

      return message;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  // Update message status
  static async updateMessageStatus(
    messageId: string,
    status: MessageStatus,
    error?: string
  ) {
    const updateData: any = {
      status,
      ...(status === MessageStatus.SENT && { sentAt: new Date() }),
      ...(status === MessageStatus.DELIVERED && { deliveredAt: new Date() }),
      ...(status === MessageStatus.FAILED && { 
        failedAt: new Date(),
        error: error || "Unknown error"
      }),
    };

    return prisma.message.update({
      where: { id: messageId },
      data: updateData,
    });
  }

  // Get campaign delivery statistics
  static async getCampaignStats(campaignId: string) {
    const messages = await prisma.message.findMany({
      where: { campaignId },
    });

    return {
      total: messages.length,
      sent: messages.filter(m => m.status === MessageStatus.SENT).length,
      delivered: messages.filter(m => m.status === MessageStatus.DELIVERED).length,
      failed: messages.filter(m => m.status === MessageStatus.FAILED).length,
      pending: messages.filter(m => m.status === MessageStatus.PENDING).length,
    };
  }
} 