export function mysqlDate(date = new Date()) { return date.toISOString().slice(0, 19).replace('T', ' '); }
export function addMinutes(date: Date, minutes: number) { return new Date(date.getTime() + minutes * 60_000); }
export function addHours(date: Date, hours: number) { return new Date(date.getTime() + hours * 3_600_000); }
export function addDays(date: Date, days: number) { return new Date(date.getTime() + days * 86_400_000); }
