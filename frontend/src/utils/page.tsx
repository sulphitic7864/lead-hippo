export function formatTimeline(value: string | number) {
  const hours = Number(value);

  if (!hours) return "";

  if (hours < 24) {
    return `Contacted within ${hours} hours`;
  }

  const days = hours / 24;

  return `Contacted within ${days} ${days === 1 ? "day" : "days"}`;
}