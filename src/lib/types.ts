export type Exchange = "drift" | "mango" | "zeta";
export type FundingDirection = "longs_pay" | "shorts_pay" | "neutral";

export interface FundingRate {
  exchange: Exchange;
  market: string;
  baseToken: string;
  hourlyRate: number;
  annualizedRate: number;
  direction: FundingDirection;
  openInterestLong: number;
  openInterestShort: number;
  timestamp: number;
}

export interface FundingHistory {
  market: string;
  exchange: Exchange;
  samples: Array<{ rate: number; timestamp: number }>;
  avgRate: number;
  minRate: number;
  maxRate: number;
}

export interface FundingAlert {
  id: string;
  type: "extreme_positive" | "extreme_negative" | "flip" | "divergence";
  market: string;
  exchange: Exchange;
  currentRate: number;
  annualizedRate: number;
  message: string;
  opportunity: string;
  confidence: number;
  generatedAt: number;
}
