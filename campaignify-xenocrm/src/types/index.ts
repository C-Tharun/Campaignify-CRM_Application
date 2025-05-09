import { Customer, Order, Segment, Campaign, Message } from "@prisma/client";

export type CustomerWithCount = Customer & {
  _count: {
    orders: number;
  };
};

export type OrderWithCustomer = Order & {
  customer: Customer;
};

export type SegmentWithCount = Segment & {
  _count: {
    customers: number;
    campaigns: number;
  };
};

export type CampaignWithDetails = Campaign & {
  segment: Segment;
  _count: {
    messages: number;
  };
};

export type MessageWithDetails = Message & {
  campaign: Campaign;
}; 