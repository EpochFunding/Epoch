import type { FundingRate } from "../lib/types.js";
import { config } from "../lib/config.js";

export function detectExtremes(rates: FundingRate[]): FundingRate[] {
  return rates.filter((r) => Math.abs(r.hourlyRate) >= config.EXTREME_RATE_THRESHOLD);
}

export function getRateSummary(rates: FundingRate[]): {
  mostPositive: FundingRate | null;
  mostNegative: FundingRate | null;
  extremes: FundingRate[];
} {
  if (rates.length === 0) return { mostPositive: null, mostNegative: null, extremes: [] };

  const sorted = [...rates].sort((a, b) => b.hourlyRate - a.hourlyRate);
  return {
    mostPositive: sorted[0] ?? null,
    mostNegative: sorted[sorted.length - 1] ?? null,
    extremes: detectExtremes(rates),
  };
}
