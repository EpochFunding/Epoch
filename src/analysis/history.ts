import type { FundingRate, FundingHistory } from "../lib/types.js";
import { config } from "../lib/config.js";

const historyStore = new Map<string, Array<{ rate: number; timestamp: number }>>();

export function updateHistory(rates: FundingRate[]): void {
  const cutoff = Date.now() - config.HISTORY_WINDOW_HOURS * 3600_000;
  for (const r of rates) {
    const key = `${r.exchange}:${r.market}`;
    const history = historyStore.get(key) ?? [];
    history.push({ rate: r.hourlyRate, timestamp: r.timestamp });
    const trimmed = history.filter((h) => h.timestamp > cutoff);
    historyStore.set(key, trimmed);
  }
}

export function getHistory(exchange: string, market: string): FundingHistory {
  const key = `${exchange}:${market}`;
  const samples = historyStore.get(key) ?? [];
  const values = samples.map((s) => s.rate);
  return {
    market,
    exchange: exchange as FundingHistory["exchange"],
    samples,
    avgRate: values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0,
    minRate: values.length ? Math.min(...values) : 0,
    maxRate: values.length ? Math.max(...values) : 0,
  };
}

export function crossedZeroRecently(exchange: string, market: string): boolean {
  const key = `${exchange}:${market}`;
  const samples = historyStore.get(key) ?? [];
  if (samples.length < 2) return false;
  const recent = samples.slice(-6).map((sample) => sample.rate).filter((value) => value !== 0);
  if (recent.length < 2) return false;
  return recent.some((value, index) => index > 0 && Math.sign(value) !== Math.sign(recent[index - 1]));
}
