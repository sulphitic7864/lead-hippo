export interface AdminSession {
  id: number;
  email: string;
  displayName: string;
  sessionId: string;
}

export interface PublicLead {
  id: number;
  leadCode: string;
  title: string;
  slug: string;
  trade: { id: number; name: string; slug: string };
  city: string;
  region: string;
  budgetMinCents: number;
  budgetMaxCents: number;
  timeline: string;
  description: string;
  hippoScore: number;
  priceCents: number;
  currency: string;
  spotsRemaining: number;
  status: 'ACTIVE' | 'SOLD_OUT';
  isFeatured: boolean;
  isNew: boolean;
  publishedAt: string | null;
  photos: Array<{ id: number; url: string; isPrimary: boolean; sortOrder: number }>;
  scoreReasons: string[];
}
