import Anthropic from "@anthropic-ai/sdk";
import type { FundingRate, FundingAlert, Exchange } from "../lib/types.js";
import { EPOCH_SYSTEM } from "./prompts.js";
import { config } from "../lib/config.js";
import { log } from "../lib/logger.js";
import { crossedZeroRecently, getHistory } from "../analysis/history.js";
import crypto from "crypto";

const client = new Anthropic({ apiKey: config.ANTHROPIC_API_KEY });

const tools: Anthropic.Tool[] = [
  {
    name: "get_rates_overview",
    description: "All current funding rates sorted by magnitude",
    input_schema: { type: "object" as const, properties: {} },
  },
  {
    name: "get_market_history",
    description: "24h funding rate history for a specific market",
    input_schema: {
      type: "object" as const,
      properties: {
        exchange: { type: "string" },
        market: { type: "string" },
      },
      required: ["exchange", "market"],
    },
  },
  {
    name: "get_extremes",
    description: "Only markets with rates exceeding the extreme threshold",
    input_schema: { type: "object" as const, properties: {} },
  },
  {
    name: "emit_alert",
    description: "Emit a funding rate alert with opportunity",
    input_schema: {
      type: "object" as const,
      properties: {
        type: { type: "string", enum: ["extreme_positive", "extreme_negative", "flip"] },
        market: { type: "string" },
        exchange: { type: "string" },
        current_rate: { type: "number" },
        annualized_rate: { type: "number" },
        message: { type: "string" },
        opportunity: { type: "string" },
        confidence: { type: "number" },
      },
      required: ["type", "market", "exchange", "current_rate", "annualized_rate", "message", "opportunity", "confidence"],
    },
  },
];

export async function runEpochAgent(rates: FundingRate[], extremes: FundingRate[]): Promise<FundingAlert[]> {
  const alerts: FundingAlert[] = [];
  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: `${rates.length} markets scanned. ${extremes.length} extreme rates detected. Analyze and emit alerts.`,
    },
  ];

  for (let turn = 0; turn < 12; turn++) {
    const response = await client.messages.create({
      model: config.CLAUDE_MODEL,
      max_tokens: 3000,
      system: EPOCH_SYSTEM,
      tools,
      messages,
    });

    messages.push({ role: "assistant", content: response.content });
    if (response.stop_reason !== "tool_use") break;

    const results: Anthropic.ToolResultBlockParam[] = [];

    for (const block of response.content) {
      if (block.type !== "tool_use") continue;
      const input = block.input as Record<string, unknown>;
      let result = "";

      if (block.name === "get_rates_overview") {
        result = JSON.stringify(
          [...rates].sort((a, b) => Math.abs(b.hourlyRate) - Math.abs(a.hourlyRate)).map((r) => ({
            market: r.market,
            exchange: r.exchange,
            hourly: (r.hourlyRate * 100).toFixed(4) + "%",
            annualized: (r.annualizedRate * 100).toFixed(1) + "%",
            direction: r.direction,
          }))
        );
      } else if (block.name === "get_market_history") {
        const h = getHistory(input.exchange as string, input.market as string);
        result = JSON.stringify({
          ...h,
          avgAnnualized: (h.avgRate * 24 * 365 * 100).toFixed(1) + "%",
          sampleCount: h.samples.length,
          crossedZeroRecently: crossedZeroRecently(input.exchange as string, input.market as string),
        });
      } else if (block.name === "get_extremes") {
        result = JSON.stringify(extremes.map((r) => ({
          market: r.market, exchange: r.exchange,
          annualized: (r.annualizedRate * 100).toFixed(1) + "%",
          direction: r.direction,
        })));
      } else if (block.name === "emit_alert") {
        if ((input.confidence as number) < config.ALERT_MIN_CONFIDENCE) {
          result = JSON.stringify({ accepted: false });
          continue;
        }
        const alert: FundingAlert = {
          id: crypto.randomUUID(),
          type: input.type as FundingAlert["type"],
          market: input.market as string,
          exchange: input.exchange as Exchange,
          currentRate: input.current_rate as number,
          annualizedRate: input.annualized_rate as number,
          message: input.message as string,
          opportunity: input.opportunity as string,
          confidence: input.confidence as number,
          generatedAt: Date.now(),
        };
        alerts.push(alert);
        log.warn(`Alert: ${alert.market} ${alert.type} ann=${(alert.annualizedRate * 100).toFixed(0)}%`);
        result = JSON.stringify({ accepted: true, id: alert.id });
      }

      results.push({ type: "tool_result", tool_use_id: block.id, content: result });
    }

    messages.push({ role: "user", content: results });
  }

  return alerts;
}
