# DeFiLlama Drift Scanner

`scripts/drift-scanner.js` — autonomous gap finder that detects untracked
TVL across known protocol families on every supported DeFiLlama chain.

## What it does

For each `(chain × protocol-family)` pair, the scanner:

1. **Detects deployment** — checks if the family's canonical contract
   (factory or vault) has bytecode at its known address on that chain.
   Algebra is the exception — it has no canonical address and discovers
   factories dynamically from `Pool` event topics.
2. **Quantifies activity (per-family policy)** — Balancer V2, Uniswap V3,
   Algebra, and PancakeSwap V3 use `PoolCreated` / `PoolRegistered` /
   `Pool` event counts as a TVL proxy. Velodrome/Solidly uses an on-chain
   `allPoolsLength()` view call. Aave V3 and Curve use bytecode-only
   presence detection (no pool count emitted).
3. **Checks coverage** — diffs the deployment against existing
   `projects/*/index.js` adapters (chain-key match + contract address
   mention) AND against the canonical aggregator registries
   (`projects/registries/uniswapV3.js`, `aaveV3.js`, `balancer.js`) so
   protocols already wired through a registry don't surface as false-
   positive gaps.
4. **Ranks gaps** — chain TVL descending, pool count as tiebreaker.
   Optionally narrowed by `--top N`.
5. **Generates stubs** (with `--gen-stubs`) — writes `projects/<slug>/index.js`
   skeletons against the existing `projects/helper/*` modules so a real
   adapter is one tweak away from running.

## Protocol families currently supported

| Family | Canonical address | Detection method |
|---|---|---|
| Balancer V2 | `Vault` at `0xBA12222222228d8Ba445958a75a0704d566BF2C8` (identical every chain) | Bytecode check + `PoolRegistered` event count over `maxScanBlocks` window |
| Uniswap V3 | Two canonical factories | Bytecode check + `PoolCreated` event count |
| Algebra CLMM | None — discovered dynamically | `findFactoriesFromEvents` walks the chain for `Pool` topic emissions, then validates each candidate factory has bytecode and a sample child pool with bytecode. Returns **all** factories per chain. |
| Aave V3 | `PoolAddressesProvider` `0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e` | Bytecode check only (returns `pools: 1` as a presence flag — no pool count) |
| Curve DEX | `AddressProvider` `0x0000000022D53366457F9d5E68Ec105046FC4383` | Bytecode check only (returns `pools: 1` as a presence flag — no pool count) |
| Velodrome/Solidly CL | Factory `0x04625B046C69577EfC40e6c0Bb83CDBAfab5a55F` | Bytecode check + on-chain `allPoolsLength()` view call |
| PancakeSwap V3 | Canonical factory | Bytecode check + `PoolCreated` event count |

Aave V3 and Curve are detected as binary "deployed / not deployed" — no pool count, just enough to flag a chain that has the canonical contract but no covering adapter. Algebra dynamically discovers factories instead of relying on a curated list, which is what surfaces newer Algebra forks (KittenSwap, Hercules, etc.) on chains nobody has explicitly mapped.

Adding a new family is a single object literal in the `FAMILIES` map at the top of the file (see existing entries for shape).

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
| `--top N` | `50` | Limit output to top-N gaps (ranked by chain TVL, pool count as tiebreaker) |
| `--concurrency N` | `15` | Parallel chain×family probes (raise on fast network, lower on rate limits) |
| `--gen-stubs` | off | Write `projects/<slug>/index.js` adapter skeletons for each gap |
| `--timeout N` | `6000` | Per-call RPC timeout in ms |
| `--json PATH` | — | Write full gap report as JSON to PATH (in addition to table output) |
| `--max-blocks N` | per-family | Override per-family event-scan window |
| `--full-rescan` | off | Ignore incremental JSON cache and scan full window |

## Output

Header block, then a gap table, then a summary line. Columns are
chain · family · chain TVL · pools · factory address (and a parenthesized
contract name when an explorer lookup resolves it):

```
DeFiLlama Drift Scanner
═══════════════════════════════════════════════════════
Chains:   57  |  Families: balancer-v2, uniswap-v3, algebra, aave-v3, curve, velodrome-cl, pancakeswap-v3
Adapters: 4610 existing  |  Concurrency: 15
Cache: incremental — 41 chains with prior scan state
═══════════════════════════════════════════════════════

bsc                algebra            $5.5B        1   0x869479270ff5ff40a9cecd49c004d0698ab4b66a
megaeth            algebra            $659M        3   0x2aa5cdd3c365ebe2539013dd56c9cd117f0a7b65
megaeth            balancer-v2        $659M        0   0xBA12222222228d8Ba445958a75a0704d566BF2C8  (Vault)
plume_mainnet      algebra            $59M        18   0x1eb9822d5176c88b1d4eec353fa956c896d77df9
scroll             curve              $18.3M       1   0x0000000022D53366457F9d5E68Ec105046FC4383

Already covered: 64 / 77 detected deployments
Gaps found:      13
```

Each row is a `(chain, factory)` deployment with bytecode at the canonical address and no covering adapter. Sorting is **chain TVL descending, pool count as tiebreaker**. Chains the scanner can't reach (RPC unreachable, family probe times out) are silently skipped.

## Performance + caching

- **Incremental JSON cache** — by default the scanner caches per-chain
  scan windows so daily runs are ~2000× lighter on RPC than a cold full
  scan. Cache lives at `data/drift_scanner_cache.json`. Use `--full-rescan`
  to bypass and rebuild from scratch.
- **Per-family scan window** — each family declares a `maxScanBlocks`
  bound so high-throughput chains don't block on event-scan timeouts.
- **Concurrency** — `--concurrency` controls the `p-limit` semaphore
  across all chain×family probes; safe ceiling depends on your RPC
  provider's rate limits.

## False-positive controls

The scanner deliberately does NOT surface a gap when:

1. The chain is in the chain-key set of an already-existing adapter
   (`adapterCoversChain` checks `module.exports[chain]`, not substring).
2. The factory address appears in a registry file
   (`projects/registries/uniswapV3.js`, `aaveV3.js`, `balancer.js`) —
   registry entries cover protocols without a dedicated adapter file.
3. The canonical contract has no bytecode on that chain (not deployed at
   all). Per-family `maxScanBlocks` bounds keep event scans from
   timing out on high-throughput chains, so a chain with no recent events
   on a `usesEventScan: true` family doesn't escalate into noise.

Zero-pool-but-deployed contracts **are** surfaced (e.g. Balancer V2 vaults
with no `PoolRegistered` events yet). They're early-deploy signals — the
vault is live, pools usually follow within days, and a generated stub is
ready when they do.

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
