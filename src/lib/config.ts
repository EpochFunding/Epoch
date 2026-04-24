import { z } from "zod";
import dotenv from "dotenv";
dotenv.config();


const TEST_ENV = process.env.NODE_ENV === "test" || process.env.VITEST === "true";

const schema = z.object({
  ANTHROPIC_API_KEY: z.string().min(1),
  CLAUDE_MODEL: z.string().default("claude-sonnet-4-6"),
  SCAN_INTERVAL_MS: z.coerce.number().default(300_000),
  EXTREME_RATE_THRESHOLD: z.coerce.number().default(0.01),
  ALERT_MIN_CONFIDENCE: z.coerce.number().default(0.65),
  HISTORY_WINDOW_HOURS: z.coerce.number().default(24),
  TRACKED_MARKETS: z.string().default("SOL-PERP,BTC-PERP,ETH-PERP,JTO-PERP,JUP-PERP"),
});

const env = TEST_ENV
  ? {
      ANTHROPIC_API_KEY: "test-anthropic-key",
      ...process.env,
    }
  : process.env;
const parsed = schema.safeParse(env);
if (!parsed.success) {
  console.error("Config error:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = parsed.data;
export const DRIFT_API = "https://mainnet-beta.api.drift.trade";
