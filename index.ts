import { fetchDriftFundingRates } from "./src/exchanges/drift.js";
import { getRateSummary } from "./src/analysis/extremes.js";
import { updateHistory } from "./src/analysis/history.js";
import { runEpochAgent } from "./src/agent/loop.js";
import { printRatesTable, printAlerts } from "./src/alerts/printer.js";
import { config } from "./src/lib/config.js";
import { log } from "./src/lib/logger.js";

async function scan(): Promise<void> {
  const startedAt = Date.now();

  try {
    log.info("Fetching funding rates from Drift...");
    const rates = await fetchDriftFundingRates();
    if (rates.length === 0) {
      log.warn("No funding rates returned for this cycle");
      return;
    }

    updateHistory(rates);

    const { extremes, mostPositive, mostNegative } = getRateSummary(rates);
    log.info(`${rates.length} markets | ${extremes.length} extreme rates`);
    if (mostPositive) {
      log.info(`Highest: ${mostPositive.market} ${(mostPositive.annualizedRate * 100).toFixed(0)}% ann`);
    }
    if (mostNegative) {
      log.info(`Lowest: ${mostNegative.market} ${(mostNegative.annualizedRate * 100).toFixed(0)}% ann`);
    }

    printRatesTable(rates);

    if (extremes.length === 0) {
      log.info("No funding dislocations met the alert threshold this cycle");
      return;
    }

    const alerts = await runEpochAgent(rates, extremes);
    if (alerts.length === 0) {
      log.info("Agent returned no funding alerts for the current extremes");
      return;
    }

    printAlerts(alerts);
  } finally {
    const durationMs = Date.now() - startedAt;
    log.info("Epoch scan complete", { durationMs });

    if (durationMs > config.SCAN_INTERVAL_MS) {
      log.warn("Epoch scan exceeded configured interval", {
        durationMs,
        intervalMs: config.SCAN_INTERVAL_MS,
      });
    }
  }
}

async function main(): Promise<void> {
  log.info("Epoch v0.1.0 - funding rate tracker starting");
  log.info(
    `Extreme threshold: ${config.EXTREME_RATE_THRESHOLD * 100}% hourly | Interval: ${config.SCAN_INTERVAL_MS / 60000}m`,
  );

  const runLoop = async (): Promise<void> => {
    try {
      await scan();
    } catch (e) {
      log.error("Scan error:", e);
    } finally {
      setTimeout(() => {
        void runLoop();
      }, config.SCAN_INTERVAL_MS);
    }
  };

  await runLoop();
}

main().catch((e) => {
  log.error("Fatal:", e);
  process.exit(1);
});
