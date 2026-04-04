import { fetchDriftFundingRates } from "./src/exchanges/drift.js";
import { detectExtremes, getRateSummary } from "./src/analysis/extremes.js";
import { updateHistory } from "./src/analysis/history.js";
import { runEpochAgent } from "./src/agent/loop.js";
import { printRatesTable, printAlerts } from "./src/alerts/printer.js";
import { config } from "./src/lib/config.js";
import { log } from "./src/lib/logger.js";

async function scan(): Promise<void> {
  log.info("Fetching funding rates from Drift...");
  const rates = await fetchDriftFundingRates();
  updateHistory(rates);

  const { extremes, mostPositive, mostNegative } = getRateSummary(rates);
  log.info(`${rates.length} markets · ${extremes.length} extreme rates`);
  if (mostPositive) log.info(`Highest: ${mostPositive.market} ${(mostPositive.annualizedRate * 100).toFixed(0)}% ann`);
  if (mostNegative) log.info(`Lowest:  ${mostNegative.market} ${(mostNegative.annualizedRate * 100).toFixed(0)}% ann`);

  printRatesTable(rates);

  if (extremes.length > 0) {
    const alerts = await runEpochAgent(rates, extremes);
    printAlerts(alerts);
  }
}

async function main(): Promise<void> {
  log.info("Epoch v0.1.0 — funding rate tracker starting");
  log.info(`Extreme threshold: ${config.EXTREME_RATE_THRESHOLD * 100}% hourly · Interval: ${config.SCAN_INTERVAL_MS / 60000}m`);

  await scan();
  setInterval(() => scan().catch((e) => log.error("Scan error:", e)), config.SCAN_INTERVAL_MS);
}

main().catch((e) => { log.error("Fatal:", e); process.exit(1); });
