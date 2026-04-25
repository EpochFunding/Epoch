<div align="center">

# Epoch

**Funding-dislocation monitor for Solana perpetual markets.**
Epoch tracks funding regime changes, catches extreme annualized rates, and explains whether the move looks like carry, crowding, or a squeeze setup.

[![Build](https://img.shields.io/github/actions/workflow/status/EpochFunding/Epoch/ci.yml?branch=master&style=flat-square&label=Build)](https://github.com/EpochFunding/Epoch/actions)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)
[![Built with Claude Agent SDK](https://img.shields.io/badge/Built%20with-Claude%20Agent%20SDK-2dd4bf?style=flat-square)](https://docs.anthropic.com/en/docs/agents-and-tools/claude-agent-sdk)

</div>

---

Funding is one of the cleanest ways to see when positioning stops being balanced. When annualized rates stretch, the market is telling you that one side is paying too much to stay crowded.

Epoch turns that state into a readable monitor. It tracks the perp markets that matter, keeps enough history to tell whether the move is persistent or temporary, and only elevates the moments when funding becomes useful as a carry signal, a crowding warning, or a sentiment shift.

`FETCH -> STORE HISTORY -> TEST EXTREMES -> CLASSIFY -> ALERT`

---

Why Funding Matters • At a Glance • Regime Guide • What Epoch Watches • How To Read A Funding Alert • Example Output • Alert Types • Risk Controls • Quick Start

## Why Funding Matters

Price tells you where the market moved. Funding tells you what traders are paying to stay on one side of that move.

That difference is why funding deserves its own monitor. When annualized rates get extreme, the setup often stops being a simple directional story and starts becoming a crowding story. That can create carry, fragility, reversal pressure, or all three at once.

Epoch is built for that layer. It does not try to be a full perp dashboard. It is much narrower than that. It is designed to tell you when funding stopped being background noise and became information worth acting on.

## At a Glance

- `Use case`: monitoring perp funding dislocations on Solana-related markets
- `Primary input`: hourly funding, annualized funding, direction, and recent funding history
- `Primary failure mode`: reacting to a headline rate without context on persistence or recent flips
- `Best for`: operators looking for carry setups, crowding signals, or sentiment shifts in perp markets

## The Funding Regime Guide

Epoch becomes more useful when the user stops thinking in one-off prints and starts thinking in states.

| State | What it means | Why it matters |
|-------|---------------|----------------|
| `calm` | funding is near neutral | no edge yet, stay observant |
| `rich positive` | longs are paying meaningful premium | carry may be forming, crowding risk building |
| `rich negative` | shorts are paying meaningful premium | panic or forced shorting may be getting expensive |
| `flip` | funding crossed through zero with history support | positioning regime changed |
| `persistent extreme` | the same side stayed expensive across windows | the market is paying to stay crowded |

The point of the board is not merely to rank the biggest number. It is to decide which state the market entered and what that implies.

## What Epoch Watches That Most Funding Boards Do Not

Most boards stop at "the rate is high." Epoch is built to answer the next questions:

- is the rate high enough to matter
- has it stayed high long enough to become useful
- did the market recently flip from one side paying to the other
- does the move look like clean carry, unstable crowding, or a sentiment transition

That extra layer is what makes the product feel like a monitor instead of a spreadsheet.

## How It Works

Epoch follows a narrow loop:

1. fetch current funding rates for the tracked perp markets
2. append the latest samples to rolling market history
3. compare the current rate against configured extreme thresholds
4. detect sign flips only when the recent history actually crossed through zero
5. frame the alert as carry, stress, or changing sentiment

The system should be selective. A board that screams at every update teaches the user to ignore the one update that mattered.

## How To Read A Funding Alert

There are four questions that matter more than the absolute number:

1. who is paying whom
2. how expensive that payment became on an annualized basis
3. whether the rate is stabilizing, accelerating, or reverting
4. whether the recent history supports a real regime change

That is why Epoch keeps a history window. Without context, a high print can look more meaningful than it really is.

## Where Epoch Actually Helps

### Carry Setups

Sometimes the cleanest use of funding is simple: one side is paying too much, long enough, and the operator wants to know when the premium is worth attention.

### Crowding Warnings

The market can remain expensive for longer than expected, but extreme persistence still matters. It tells you positioning is stretched.

### Sentiment Transitions

Funding flips often reveal a change in posture before a narrative catches up. That is especially useful when a market stops trending smoothly and starts repricing participants.

## Example Output

```text
EPOCH // FUNDING ALERT

market             SOL-PERP
annualized rate    +92%
direction          longs pay shorts
alert type         extreme_positive
confidence         0.81

opportunity: funding is rich enough to watch for short-bias carry,
but crowding risk is elevated if the move persists.
```

## Alert Types

| Type | What it means | Typical interpretation |
|------|---------------|------------------------|
| `extreme_positive` | funding is unusually expensive on the long side | short-bias carry or crowded-long warning |
| `extreme_negative` | funding is unusually expensive on the short side | long-bias carry or panic unwind |
| `flip` | funding crossed through zero in recent history | positioning regime changed |

## What A Good Epoch Signal Looks Like

- the annualized rate is materially stretched
- the history window supports persistence or a real flip
- the alert explains whether the edge is carry, crowding, or transition
- the confidence is high enough that the print deserves attention now

That sounds basic, but it is the difference between a useful market monitor and a noisy percentage feed.

## Risk Controls

- `extreme threshold`: prevents routine funding prints from becoming alerts
- `history-backed flips`: zero-cross alerts only fire when recent samples actually support the regime change
- `confidence floor`: low-quality alerts are demoted before they reach the operator
- `tracked market scope`: the monitor stays focused on named markets instead of pretending to cover everything

Funding should be treated as a state variable, not a guaranteed trade. Epoch is strongest when it is used to frame opportunity and crowding, not as a blind execution trigger.

## Quick Start

```bash
git clone https://github.com/EpochFunding/Epoch
cd Epoch
bun install
cp .env.example .env
bun run dev
```

## Configuration

```bash
ANTHROPIC_API_KEY=sk-ant-...
SCAN_INTERVAL_MS=300000
EXTREME_RATE_THRESHOLD=0.01
ALERT_MIN_CONFIDENCE=0.65
HISTORY_WINDOW_HOURS=24
TRACKED_MARKETS=SOL-PERP,BTC-PERP,ETH-PERP,JTO-PERP,JUP-PERP
```

## Support Docs

- [Runbook](docs/runbook.md)
- [Changelog](CHANGELOG.md)
- [Contributing](CONTRIBUTING.md)
- [Security](SECURITY.md)

## License

MIT

---

*funding gets interesting when it stops looking normal.*
