export function normalizeEmail(value: string) { return value.trim().toLowerCase(); }
export function normalizePhone(value: string) { return value.replace(/\D/g, '').slice(-15); }
export function slugify(value: string) {
  return value.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 180);
}
