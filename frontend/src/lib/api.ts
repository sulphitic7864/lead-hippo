import type { ApiEnvelope,PublicLead } from '@/types';
const browserBase=process.env.NEXT_PUBLIC_API_URL||'/api';
const serverBase=process.env.INTERNAL_API_URL||'http://localhost:4000/api';
export const apiBase=()=>typeof window==='undefined'?serverBase:browserBase;
export async function apiFetch<T>(path:string,init:RequestInit={}){
  const response=await fetch(`${apiBase()}${path}`,{...init,headers:{...(init.body instanceof FormData?{}:{'Content-Type':'application/json'}),...(init.headers||{})},credentials:'include',cache:init.cache||'no-store'});
  const body=await response.json().catch(()=>({}));
  if(!response.ok) throw new Error(body?.error?.message||`Request failed (${response.status})`);
  return (body as ApiEnvelope<T>).data;
}
export async function getLeads(featured=false):Promise<PublicLead[]>{
  try{return await apiFetch<PublicLead[]>(featured?'/leads/featured':'/leads');}catch(error){console.error(error);return [];}
}
export const formatMoney=(cents:number)=>new Intl.NumberFormat('en-CA',{style:'currency',currency:'CAD',maximumFractionDigits:0}).format(cents/100);
export const formatDate=(value:string|null)=>value?new Intl.DateTimeFormat('en-CA',{dateStyle:'medium'}).format(new Date(value)):'—';
