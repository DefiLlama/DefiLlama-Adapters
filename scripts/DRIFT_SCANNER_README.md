# DeFiLlama Drift Scanner

`scripts/drift-scanner.js` — autonomous gap finder that detects untracked
TVL across known protocol families on every supported DeFiLlama chain.

## What it does

For each `(chain × protocol-family)` pair, the scanner:

1. **Detects deployment** — checks if the family's canonical contract
   (factory or vault) has bytecode at its known address on that chain.
2. **Quantifies it** — counts pool-creation events to get a pool-count
   proxy for TVL.
3. **Checks coverage** — diffs the deployment against existing
   `projects/*/index.js` adapters (using AST-aware regex on chain keys
   and contract address mentions) AND against the canonical aggregator
   registries: `projects/registries/uniswapV3.js`, `aaveV3.js`,
   `balancer.js`, etc. — so a Uniswap-V3-clone already wired into a
   registry isn't surfaced as a false-positive gap.
4. **Ranks gaps** — outputs a table sorted by pool count (TVL proxy),
   optionally narrowed by `--top N`.
5. **Generates stubs** (with `--gen-stubs`) — writes `projects/<slug>/index.js`
   skeletons using existing helper modules (`balancer`, `uniV3`, `algebra`,
   `aave-v3`, etc.) so a real adapter is one tweak away from running.

## Protocol families currently supported

| Family | Detection | Notes |
|---|---|---|
| Balancer V2 | `Vault` at `0xBA12222222228d8Ba445958a75a0704d566BF2C8` | Identical address every chain. Counts `PoolRegistered` events. |
| Uniswap V3 | Two canonical factory addresses | Counts `PoolCreated` events. |
| Algebra CLMM | Per-chain factory list (manually curated) | Counts `Pool` events; returns **all** factories per chain (multi-factory chains like Sonic). |
| Aave V3 | `PoolAddressesProvider` per chain | Counts via `PoolDataProvider.getAllReservesTokens()`. |
| Curve DEX | `MetaRegistry` + `Factory` addresses | Counts via `pool_count()`. |
| Velodrome/Solidly CL | Per-chain factory list | Counts pool-create events. |
| PancakeSwap V3 | Canonical factory address | Counts `PoolCreated` events. |

Adding a new family is a single object literal in the `FAMILIES` map at the
top of the file (see existing entries for the shape).

## Usage

```bash
# default — scan every chain × every family, print top 50 gaps
node scripts/drift-scanner.js

# narrow by chain
node scripts/drift-scanner.js --chains sonic,berachain,fraxtal

# narrow by family
node scripts/drift-scanner.js --families balancer-v2,algebra

# generate adapter stubs into projects/<slug>/index.js for each gap
node scripts/drift-scanner.js --top 30 --gen-stubs

# scan all chains with higher concurrency
node scripts/drift-scanner.js --chains all --concurrency 20

# JSON output for piping to other tools
node scripts/drift-scanner.js --json /tmp/gaps.json

# ignore incremental cache, force full rescan (default uses cache)
node scripts/drift-scanner.js --full-rescan
```

### Flags

| Flag | Default | Purpose |
|---|---|---|
| `--chains` | `all` | Comma-separated chain keys, or `all` |
| `--families` | `all` | Comma-separated family keys, or `all` |
| `--top N` | `50` | Limit output to top-N gaps by pool count |
| `--concurrency N` | `15` | Parallel chain×family probes (raise on fast network, lower on rate limits) |
| `--gen-stubs` | off | Write `projects/<slug>/index.js` adapter skeletons for each gap |
| `--timeout N` | `6000` | Per-call RPC timeout in ms |
| `--json PATH` | — | Write full gap report as JSON to PATH (in addition to table output) |
| `--max-blocks N` | per-family | Override per-family event-scan window |
| `--full-rescan` | off | Ignore incremental JSON cache and scan full window |

## Output

```
─── DRIFT GAPS ───
chain         family          deployed  pools   covered?    factory
bsc           algebra         yes       1       NO          0x869479...
megaeth       algebra         yes       3       NO          0x2aa5cd...
megaeth       balancer-v2     yes       0       NO          0xBA1222... (vault, no pools yet)
plume         algebra         yes       18      NO          0x1eb982...
scroll        curve           yes       1       NO          0x000000...

13 gap(s) | 4610 adapter(s) checked | 64 already covered
```

Each row is a `(chain, factory)` deployment that has bytecode + pool activity
but no covering adapter. Sorting is by pool count descending; chains/families
the scanner can't detect are silently skipped (no false positives).

## Performance + caching

- **Incremental JSON cache** — by default the scanner caches per-chain
  scan windows so daily runs are ~2000× lighter on RPC than a cold full
  scan. Cache lives at `cache/drift-scanner.json`. Use `--full-rescan`
  to bypass.
- **Per-family scan window** — each family declares a `maxScanBlocks`
  bound so high-throughput chains don't block on event-scan timeouts.
- **Concurrency** — `--concurrency` controls the `p-limit` semaphore
  across all chain×family probes; safe ceiling depends on your RPC
  provider's rate limits.

## False-positive controls

The scanner deliberately does NOT surface a gap when:

1. The chain is in a chain-key alias for an already-existing adapter
   (`adapterCoversChain` checks `module.exports[chain]`, not just substring
   matches).
2. The factory address appears in a registry file
   (`projects/registries/uniswapV3.js`, `aaveV3.js`, `balancer.js`) — registry
   entries cover protocols without a dedicated adapter file.
3. The deployment has zero pool-creation events (deployed contract,
   no liquidity yet — not a real gap to fix).
4. The chain is a known dead deployment (Multichain-collapse Fantom etc.)
   when the family declares `usesEventScan: true` and finds zero recent
   events.

## Sample run output

A scan from 2026-05-03 found 13 deployed-but-uncovered factories across
57 chains, including:

- **Plume Mainnet** — Algebra CLMM factory `0x1eb982...` (18 pools)
- **MegaETH** — Algebra CLMM factory `0x2aa5cd...` (3 pools)
- **BSC** — Algebra CLMM factory `0x869479...` (1 pool, $5.5B chain TVL)
- **Scroll** — Curve `MetaRegistry` (1 pool)
- 9 Balancer V2 vault deployments with zero pools yet (early-deploy signals)

Each becomes a candidate adapter PR. Generated stubs against the existing
`projects/helper/balancer.js`, `projects/helper/algebra.js`, etc., compile
cleanly with `node test.js projects/<slug>` after a small per-protocol tweak.

## Why a tool?

The scanner exists because manually grepping `projects/` to check whether a
new on-chain factory deployment is already adapted doesn't scale across
~600 chains × dozens of protocol families. Codifying the coverage check
catches early-deployment activity inside the existing review pipeline rather
than after a community user files a "missing chain" issue.

It is also useful for adapter-authors as a self-check — point it at a chain
you just submitted an adapter for and confirm the gap is closed.

## Status

Standalone Node.js script. No new dependencies beyond `@defillama/sdk`
and `p-limit` (both already in `package.json`). Runs against the same RPC
and `api.llama.fi` endpoints that the rest of the repo uses.

If useful, can be wired into a scheduled CI run (e.g. weekly via GitHub
Actions) emitting a gap report as a PR comment or repo issue. Current
implementation is fire-and-forget — no daemon, no state outside the
optional cache file.
