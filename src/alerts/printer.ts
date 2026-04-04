import type { FundingAlert, FundingRate } from "../lib/types.js";

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[93m";
const CYAN = "\x1b[36m";
const DIM = "\x1b[2m";

export function printRatesTable(rates: FundingRate[]): void {
  const bar = "─".repeat(72);
  console.log(`\n${bar}`);
  console.log(`  ${BOLD}EPOCH — FUNDING RATES${RESET}  (${rates.length} markets)`);
  console.log(bar);
  console.log(`  ${"MARKET".padEnd(16)} ${"EXCHANGE".padEnd(10)} ${"HOURLY".padEnd(12)} ${"ANNUALIZED".padEnd(14)} DIRECTION`);
  console.log(`  ${"─".repeat(68)}`);

  const sorted = [...rates].sort((a, b) => Math.abs(b.hourlyRate) - Math.abs(a.hourlyRate));
  for (const r of sorted.slice(0, 10)) {
    const ann = (r.annualizedRate * 100).toFixed(1);
    const hr = (r.hourlyRate * 100).toFixed(4);
    const color = r.hourlyRate > 0.005 ? RED : r.hourlyRate < -0.005 ? GREEN : DIM;
    const dir = r.direction === "longs_pay" ? `${RED}longs pay${RESET}` : r.direction === "shorts_pay" ? `${GREEN}shorts pay${RESET}` : `${DIM}neutral${RESET}`;
    console.log(`  ${r.market.padEnd(16)} ${r.exchange.padEnd(10)} ${color}${hr}%${RESET}`.padEnd(46) + `${color}${ann}%${RESET}`.padEnd(20) + dir);
  }
  console.log(`${bar}\n`);
}

export function printAlerts(alerts: FundingAlert[]): void {
  if (alerts.length === 0) return;
  console.log(`\n  ${BOLD}${alerts.length} FUNDING ALERTS${RESET}\n`);
  for (const a of alerts) {
    const color = a.type === "extreme_positive" ? RED : a.type === "extreme_negative" ? GREEN : CYAN;
    const ann = (a.annualizedRate * 100).toFixed(0);
    console.log(`  ${BOLD}${color}${a.type.replace(/_/g, " ").toUpperCase()}${RESET}  ${a.market}  ${ann}% annualized`);
    console.log(`  ${a.message}`);
    console.log(`  ${BOLD}→ ${a.opportunity}${RESET}\n`);
  }
}
