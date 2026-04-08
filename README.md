<div align="center">

# Epoch

**Perpetual funding rate tracker for Solana.**
Monitors Drift every 5 minutes. Flags extreme rates and tells you exactly how to profit from them.

[![Build](https://img.shields.io/github/actions/workflow/status/EpochFunding/Epoch/ci.yml?branch=master&style=flat-square&label=Build)](https://github.com/EpochFunding/Epoch/actions)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)
[![Built with Claude Agent SDK](https://img.shields.io/badge/Built%20with-Claude%20Agent%20SDK-2dd4bf?style=flat-square)](https://docs.anthropic.com/en/docs/agents-and-tools/claude-agent-sdk)

</div>

---

Funding rates are one of the most reliable signals in crypto. When SOL-PERP funding hits 142% annualized, longs are paying shorts an insane premium — and that's a trade. `Epoch` tracks every perp market on Drift, stores 24h rolling history, and uses Claude to identify extremes and assess whether they represent a funding arb, a directional signal, or an imminent squeeze.

```
FETCH → HISTORY → EXTREMES → CLASSIFY → ALERT
```

---

## Rate Chart

![Epoch Rates](assets/preview-rates.svg)

---

## Funding Alert

![Epoch Alert](assets/preview-alert.svg)

---

## Alert Types

| Type | Condition | Opportunity |
|------|-----------|-------------|
| **extreme_positive** | Annualized > +87% | Short to earn funding |
| **extreme_negative** | Annualized < −30% | Long to earn funding |
| **flip** | Rate crossed zero | Sentiment shift — watch direction |
| **divergence** | Same token, different rates | Cross-exchange arb |

---

## Quick Start

```bash
git clone https://github.com/EpochFunding/Epoch
cd Epoch && bun install
cp .env.example .env
bun run dev
```

---

## License

MIT

---

*funding rates don't lie.*
