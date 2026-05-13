# Durianfun — Launchpad TVL adapter

| Field | Value |
|---|---|
| Protocol name | Durianfun |
| Category | Launchpad |
| Chain | Bitkub Chain (chainId 96) |
| Website | https://durianfun.xyz |
| Twitter | @durianfunlabs |
| Logo | https://durianfun.xyz/og-image-v2.png |

## Methodology

```
TVL = Σ(native KUB held by every BondingCurveMarket NOT yet graduated)
    + Σ(native KUB held by every DurianAMM pool produced by graduations)
```

Across all three factory generations:

| Factory | Address | Deploy block | Status |
|---|---|---|---|
| V4.2 (legacy main) | `0xeadEc9dA89F97Ae6215362EBA4B33F3F1d1775b2` | 30,990,140 | Frozen |
| V4.5 (sacred main) | `0xdf4f3dB298A9aDe853191F58b4b2a322D47EC005` | 30,999,992 | Frozen |
| V4.6.6 Deluxe (live) | `0x89b6b73BD18dbEA0e2218c25c1963fd5FBaB3c87` | 31,393,573 | Production |

## What's excluded and why

- **Token-side AMM reserves** — each meme token's only price discovery
  IS the pool itself. Counting both sides would inflate via circular
  tautology. The token half was protocol-minted, not user-deposited.
- **Factory-D test environment** (V2.5 + V2.4.2) — base asset dKUB is
  mintable by the project, so not real protocol TVL.

## Discovery

All three factories emit the identical-signature event:

```solidity
event TokenCreated(
    address indexed token,
    address indexed market,    // BCM that holds KUB pre-graduation
    address indexed creator,
    string name, string symbol,
    uint256 totalSupply,
    uint256 timestamp
);
```

Each BCM exposes `function ammPool() view returns (address)` — non-zero
once graduated. We split discovered markets into (ungraduated-BCM,
live-AMM) and `sumTokens` native KUB across both sets.

## Sibling adapters

- `projects/durianfun-bond/index.js` — Bond Pool V2 TVL
- `projects/durianfun-yield/index.js` — LP-staking Yield Vault TVL

Volume + APY adapters live in sibling DefiLlama repos:

- `dimension-adapters/aggregators/durianfun/index.ts` — DEX-aggregator volume
- `yield-server/src/adaptors/durianfun-bond/index.ts` — Bond Pool APYs
