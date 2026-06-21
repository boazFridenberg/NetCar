
const UNIT_MS: Record<string, number> = {
  ms: 1,
  s: 1000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
  w: 604_800_000,
};

export default function ms(value: string | number): number {
  if (typeof value === 'number') return value;
  const match = /^(\d+(?:\.\d+)?)\s*(ms|s|m|h|d|w)?$/.exec(value.trim());
  if (!match) return 0;
  const amount = parseFloat(match[1]);
  const unit = match[2] ?? 's';
  return Math.round(amount * UNIT_MS[unit]);
}
