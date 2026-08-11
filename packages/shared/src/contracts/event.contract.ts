export interface EventSummary {
  id: string;
  title: string;
  date: string; // ISO 8601
  venue: string;
  priceCents: number;
  imageUrl?: string;
}

export interface EventDetail extends EventSummary {
  description?: string;
  capacity: number;
  available: number;
}
