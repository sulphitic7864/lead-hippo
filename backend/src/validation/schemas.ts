import { z } from 'zod';

export const checkoutSchema = z.object({
  leadCodes: z.array(z.string().min(5).max(20)).min(1).max(10).transform((items) => [...new Set(items)]),
  companyName: z.string().min(2).max(190),
  email: z.string().email().max(190),
  phone: z.string().min(7).max(40),
  marketingConsent: z.boolean().default(false),
  acceptedTerms: z.literal(true)
});

export const contactSchema = z.object({
  name: z.string().min(2).max(160),
  company: z.string().max(190).optional().default(''),
  email: z.string().email().max(190),
  phone: z.string().min(7).max(40),
  message: z.string().min(10).max(5000)
});

export const refundClaimSchema = z.object({
  purchaseId: z.coerce.number().int().positive(),
  email: z.string().email(),
  reason: z.enum(['UNREACHABLE','INVALID_CONTACT','PROJECT_CANCELLED_BEFORE_CONTACT','DUPLICATE_CHARGE','OTHER']),
  contractorMessage: z.string().min(10).max(5000),
  contactAttemptLog: z.string().max(5000).optional().default('')
});

const consentSchema = z.object({
  method: z.enum(['PHONE_VERBAL','SMS_REPLY','EMAIL','WRITTEN']),
  text: z.string().max(5000).optional().default(''),
  receivedAt: z.string().datetime(),
  notes: z.string().max(5000).optional().default('')
});

const leadBaseSchema = z.object({
  title: z.string().min(3).max(180),
  tradeTypeId: z.coerce.number().int().positive(),
  city: z.string().min(2).max(100),
  region: z.string().min(2).max(100).default('ON'),
  budgetMinCents: z.coerce.number().int().nonnegative(),
  budgetMaxCents: z.coerce.number().int().nonnegative(),
  timeline: z.string().min(2).max(120),
  description: z.string().min(20).max(10000),
  hippoScore: z.coerce.number().int().min(0).max(100),
  priceCents: z.coerce.number().int().positive(),
  spotsTotal: z.coerce.number().int().min(1).max(3).default(3),
  homeownerName: z.string().min(2).max(160),
  homeownerPhone: z.string().min(7).max(40),
  homeownerEmail: z.union([z.string().email(), z.literal('')]).optional().default(''),
  preferredContact: z.enum(['PHONE','TEXT','EMAIL']),
  homeownerContactedAt: z.string().datetime(),
  consentConfirmed: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  scoreReasons: z.array(z.string().min(2).max(180)).max(12).default([]),
  consent: consentSchema.optional()
});


export const leadSchema = leadBaseSchema.refine((v) => v.budgetMinCents <= v.budgetMaxCents, { message: 'Minimum budget cannot exceed maximum budget', path: ['budgetMinCents'] });
export const leadUpdateSchema = leadBaseSchema.partial().refine((v) => v.budgetMinCents === undefined || v.budgetMaxCents === undefined || v.budgetMinCents <= v.budgetMaxCents, { message: 'Minimum budget cannot exceed maximum budget', path: ['budgetMinCents'] });
