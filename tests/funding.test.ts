import { describe, it, expect } from "vitest";
import type { FundingRate } from "../src/lib/types.js";

function makeRate(hourlyRate: number, market = "SOL-PERP"): FundingRate {
  return {
    exchange: "drift",
    market,
    baseToken: "SOL",
    hourlyRate,
    annualizedRate: hourlyRate * 24 * 365,
    direction: hourlyRate > 0.00005 ? "longs_pay" : hourlyRate < -0.00005 ? "shorts_pay" : "neutral",
    openInterestLong: 1_000_000,
    openInterestShort: 900_000,
    timestamp: Date.now(),
  };
}

describe("funding rate direction", () => {
  it("positive rate = longs pay", () => {
    expect(makeRate(0.001).direction).toBe("longs_pay");
  });
  it("negative rate = shorts pay", () => {
    expect(makeRate(-0.001).direction).toBe("shorts_pay");
  });
  it("near-zero = neutral", () => {
    expect(makeRate(0.00001).direction).toBe("neutral");
  });
});

describe("annualized rate", () => {
  it("1% hourly annualizes to 87.6x", () => {
    const r = makeRate(0.01);
    expect(r.annualizedRate).toBeCloseTo(0.01 * 24 * 365, 5);
  });
});

describe("extreme detection", () => {
  it("detects rates above threshold", async () => {
    const { detectExtremes } = await import("../src/analysis/extremes.js");
    const rates = [makeRate(0.02), makeRate(0.005), makeRate(-0.015)];
    const extremes = detectExtremes(rates);
    expect(extremes.length).toBe(2);
  });

  it("summary returns most positive and negative", async () => {
    const { getRateSummary } = await import("../src/analysis/extremes.js");
    const rates = [makeRate(0.005, "SOL-PERP"), makeRate(-0.02, "BTC-PERP"), makeRate(0.015, "ETH-PERP")];
    const { mostPositive, mostNegative } = getRateSummary(rates);
    expect(mostPositive?.market).toBe("ETH-PERP");
    expect(mostNegative?.market).toBe("BTC-PERP");
  });
});
