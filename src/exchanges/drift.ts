import type { FundingRate, FundingDirection } from "../lib/types.js";
import { config, DRIFT_API } from "../lib/config.js";

interface DriftMarket {
  marketIndex: number;
  name: string;
  fundingRate1h: string;
  fundingRate8h: string;
  openInterestLong: string;
  openInterestShort: string;
}

function toDirection(rate: number): FundingDirection {
  if (rate > 0.00005) return "longs_pay";
  if (rate < -0.00005) return "shorts_pay";
  return "neutral";
}

export async function fetchDriftFundingRates(): Promise<FundingRate[]> {
  const url = `${DRIFT_API}/v2/markets?marketType=perp`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Drift API ${res.status}`);

  const data = await res.json() as { markets: DriftMarket[] };
  const rates: FundingRate[] = [];
  const trackedMarkets = new Set(
    config.TRACKED_MARKETS.split(",").map((market: string) => market.trim()).filter(Boolean)
  );

  for (const market of data.markets ?? []) {
    if (!trackedMarkets.has(market.name)) continue;
    const hourlyRate = parseFloat(market.fundingRate1h ?? "0") / 1e9;
    if (isNaN(hourlyRate)) continue;

    rates.push({
      exchange: "drift",
      market: market.name,
      baseToken: market.name.split("-")[0],
      hourlyRate,
      annualizedRate: hourlyRate * 24 * 365,
      direction: toDirection(hourlyRate),
      openInterestLong: parseFloat(market.openInterestLong ?? "0"),
      openInterestShort: parseFloat(market.openInterestShort ?? "0"),
      timestamp: Date.now(),
    });
  }

  return rates;
}
