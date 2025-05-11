import { PrismaClient, MessageStatus, MessageType } from "@prisma/client";

const prisma = new PrismaClient();

export class MessageService {
  static async sendMessage({
    campaignId,
    customerId,
    content,
    type = MessageType.EMAIL,
  }: {
    campaignId: string;
    customerId: string;
    content: string;
    type?: MessageType;
  }) {
    // Create message record
    const message = await prisma.message.create({
      data: {
        campaignId,
        customerId,
        content,
        type,
        status: MessageStatus.PENDING,
      },
    });

    try {
      // Simulate message delivery (90% success rate)
      const isSuccess = Math.random() < 0.9;
      
      // Update message status
      await prisma.message.update({
        where: { id: message.id },
        data: {
          status: isSuccess ? MessageStatus.DELIVERED : MessageStatus.FAILED,
          deliveredAt: isSuccess ? new Date() : null,
          error: isSuccess ? null : "Failed to deliver message",
        },
      });

      return message;
    } catch (error) {
      // Update message status to failed
      await prisma.message.update({
        where: { id: message.id },
        data: {
          status: MessageStatus.FAILED,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      });

      throw error;
    }
  }

  static async getMessageStats(campaignId: string) {
    const stats = await prisma.message.groupBy({
      by: ["status"],
      where: { campaignId },
      _count: true,
    });

    return {
      total: stats.reduce((acc, curr) => acc + curr._count, 0),
      delivered: stats.find((s) => s.status === MessageStatus.DELIVERED)?._count || 0,
      failed: stats.find((s) => s.status === MessageStatus.FAILED)?._count || 0,
      pending: stats.find((s) => s.status === MessageStatus.PENDING)?._count || 0,
    };
  }
} 