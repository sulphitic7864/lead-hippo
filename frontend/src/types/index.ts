export interface LeadPhoto {id:number;url:string;isPrimary:boolean;sortOrder:number;}
export interface PublicLead {
  id:number;leadCode:string;title:string;slug:string;trade:{id:number;name:string;slug:string};city:string;region:string;
  budgetMinCents:number;budgetMaxCents:number;timeline:string;description:string;hippoScore:number;priceCents:number;currency:string;
  spotsRemaining:number;status:'ACTIVE'|'SOLD_OUT';isFeatured:boolean;isNew:boolean;publishedAt:string|null;photos:LeadPhoto[];scoreReasons:string[];
}
export interface AdminLead extends Omit<PublicLead,'status'> {
  status:'DRAFT'|'ACTIVE'|'SOLD_OUT'|'ARCHIVED';spotsTotal:number;homeownerName:string;homeownerPhone:string;homeownerEmail:string|null;
  preferredContact:'PHONE'|'TEXT'|'EMAIL';homeownerContactedAt:string;consentConfirmed:boolean;consentConfirmedAt:string|null;expiresAt:string|null;viewCount:number;createdAt:string;updatedAt:string;
}
export interface ApiEnvelope<T>{data:T;}
