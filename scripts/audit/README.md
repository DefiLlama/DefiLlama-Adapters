# Structural audit scripts

Complementary to DefiLlama's existing TVL spike detector (`defillama-server/defi/src/api2/scripts/tvlSpikeDetector.ts`). The spike detector watches for **changes** in TVL — anomalies relative to a protocol's recent history. These scripts watch for **shapes** — always-on data bugs that don't manifest as a spike because they were already present at day-zero.

The class of bug each catches is the kind that survives until somebody manually finds it: a mistyped address checksum, a token whose on-chain `symbol()` no longer matches the key it's filed under, a whitelist option that fails closed because of a config-key typo, a DEX adapter that enumerates its token universe from an unfiltered source. Spike detector won't fire on any of these — they were always wrong.

## Scripts

| Script | What it checks | Network calls |
|--------|----------------|---------------|
| `core-assets.js` | Static checks against `projects/helper/coreAssets.json`: EIP-55 checksum sanity, placeholder addresses, suspicious symbol names, cross-chain symbol/address mismatch | None |
| `onchain-symbols.js` | Reads on-chain `symbol()` for every EVM entry and compares to its key — finds renamed tokens, dead contracts, wrong-address bugs | RPC multicall per chain |
| `dex-token-universe.js` | Greps adapter source for risky token-universe sources (explorer APIs, unfiltered factory enumeration, balance-of-anything loops) | None |
| `uni-tvl-no-whitelist.js` | Finds `getUniTVL({...})` calls that don't enable `useDefaultCoreAssets` and don't pass a custom `coreAssets` array — DogePay-class contamination risk | None |

## Usage

```sh
# Pure-static structural checks against coreAssets.json
node scripts/audit/core-assets.js
node scripts/audit/core-assets.js --chain=tempo --severity=high

# On-chain symbol cross-check (needs RPC access)
node scripts/audit/onchain-symbols.js                       # default chain set
node scripts/audit/onchain-symbols.js --chain=ethereum
node scripts/audit/onchain-symbols.js --chains=ethereum,bsc

# Adapter-source scans (instant)
node scripts/audit/dex-token-universe.js
node scripts/audit/uni-tvl-no-whitelist.js
```

`AUDIT_JSON=1` on any script appends a JSON dump of the findings — convenient for piping into other tooling.

## Findings these surfaced (cross-linked PRs)

- `coreAssets.saga.tBTC` had an invalid EIP-55 checksum (a single character mis-cased). `ethers` v6 rejects this on `getAddress`/`encodeFunctionData`, which silently breaks any `multiCall` path that touches the address.
- `projects/archly-finance/index.js` had `seDefaultCoreAssets: true` (missing the `u`) on two of its nine chain blocks. JavaScript silently dropped the unknown key, leaving `useDefaultCoreAssets` at its `false` default, and the core-asset whitelist was never applied for those chains.

## What these scripts deliberately don't do

These scripts catch *shape* bugs, not *value* bugs. Detecting that a TVL number is wrong by 30 % is the spike detector's job — it has access to historical series and protocol-level baselines. These scripts can only tell you when something looks structurally implausible (wrong type, wrong format, wrong link) and let the human follow up.

False-positive triage matters. The cross-chain symbol-mismatch and suspicious-name checks in particular surface a lot of *renamed tokens* (Polygon's MATIC→POL, Mento's cUSD→USDm, Tether's USDT→USD₮) where the address is correct and the only thing wrong is that the registry key now confuses readers. These are still findings worth knowing about, but they aren't TVL bugs — they're naming-debt.
