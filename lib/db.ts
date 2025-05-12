import { prisma } from './prisma'

export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error | null = null

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      
      // Check if it's a connection error
      if (
        error instanceof Error &&
        (error.message.includes('Too many connections') ||
         error.message.includes('Connection'))
      ) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
        continue
      }
      
      // If it's not a connection error, throw immediately
      throw error
    }
  }

  throw lastError || new Error('Max retries reached')
}

// Example usage:
export async function getCampaignWithRetry(campaignId: string) {
  return withRetry(() =>
    prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        segment: true,
        messages: true
      }
    })
  )
} 