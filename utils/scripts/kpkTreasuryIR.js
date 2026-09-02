/**
 * kpk treasury reporting: the fully on-chain kpk mandate adapter, the replay and
 * daily-cache harness that runs it at past dates, and the DeBank view of the same
 * mandates right now.
 *
 * projects/kpk reads DeBank and therefore only resolves at the current block. The
 * adapter in the first half of this file is the on-chain equivalent, so it can be
 * run at an arbitrary timestamp; the rest is everything that drives it - the
 * historical replay, the denomination split, the R2 cache job, and the DeBank read.
 *
 * The two sources answer different questions and one file holds both on purpose: RPC
 * is the only thing that can be backdated, DeBank is the only thing that can say what
 * is held right now, and they share a roster - so keeping them apart guarantees they
 * drift. See REPORT MODE for how far apart the two figures actually sit.
 *
 * FOUR MODES
 *
 * replay (default) - run the adapter at the given dates and write records out:
 *   node utils/scripts/kpkTreasuryIR.js 2026-08-29
 *   node utils/scripts/kpkTreasuryIR.js 2026-01-01 2026-04-01 2026-08-01
 *   node utils/scripts/kpkTreasuryIR.js --from=2026-01-01 --to=2026-08-01 --step=1mo
 *   node utils/scripts/kpkTreasuryIR.js --from=2026-01-01 --to=2026-08-01 --out=kpk.csv
 *
 * cache (--cache) - THE scheduled job: fill the stored history, snapshot DeBank, and
 * stand DeBank's reading in as the latest day:
 *   node utils/scripts/kpkTreasuryIR.js --cache            # every gap in the last 365 days
 *   node utils/scripts/kpkTreasuryIR.js --cache --no-debank # RPC backfill only, no snapshot
 *   node utils/scripts/kpkTreasuryIR.js --cache --status   # report coverage, run nothing
 *   node utils/scripts/kpkTreasuryIR.js --cache --limit=10 # chip away at a backfill
 *   node utils/scripts/kpkTreasuryIR.js --cache --refill=2026-08-29
 *
 * debank (--debank) - the same mandates as DeBank sees them, right now:
 *   node utils/scripts/kpkTreasuryIR.js --debank --list           # roster only, no API calls
 *   node utils/scripts/kpkTreasuryIR.js --debank --out=debank.json > debank.ndjson
 *   node utils/scripts/kpkTreasuryIR.js --debank --shape=report --pretty
 *   node utils/scripts/kpkTreasuryIR.js --debank --in=debank.json --shape=report
 *
 * report (--report) - the chart and the stored positions as one document. A pure read
 * of what --cache wrote: it calls nothing unless you ask it to.
 *   node utils/scripts/kpkTreasuryIR.js --report --out=kpk.json   # last 365 days + now
 *   node utils/scripts/kpkTreasuryIR.js --report --live           # fetch DeBank now instead
 *   node utils/scripts/kpkTreasuryIR.js --report --rpc-only       # no DeBank point on the chart
 *   node utils/scripts/kpkTreasuryIR.js --report --in=debank.json # reuse a saved fetch
 *
 * Cache mode reads the stored history, works out which dates in the last WINDOW_DAYS
 * (365) days have no entry, and re-enters this file in replay mode for exactly those.
 * So the first run backfills the year and every later run does just the day that
 * appeared since - a daily job converges to one date per run. Each date is persisted
 * as it lands, so an interrupted backfill resumes from the first still-missing date.
 *
 * The store is therefore NOT a homogeneous RPC series, and consumers have to know it.
 * A cache run also writes DeBank's rolled-up reading in as the LATEST day, tagged
 * `source: "debank"`, because an RPC record is a 00:00:00 UTC snapshot that can be
 * most of a day stale where DeBank is now.
 *
 * That record is FINAL, and preferring it is a judgement about ACCURACY rather than
 * only freshness: the adapter above values a hardcoded component list, so it can only
 * see positions someone has already registered, where DeBank discovers what the Safes
 * actually hold. RPC stands in only when DeBank was unavailable.
 *
 * So nothing replaces a stored DeBank record, no published number revises after the
 * fact, and the replay does not revisit the date - from the changeover onward the
 * series is DeBank's and the RPC half only ever fills genuine holes. A record with no
 * `source` field at all is the RPC history that predates the change. Only an explicit
 * --refill=<date> turns a DeBank date back into a replayed one.
 *
 * The cost is one seam where the two sources meet. Ex-curated, DeBank runs 1.4-2.0%
 * ABOVE the on-chain figure per client, so the single hop from the last RPC record to
 * the first DeBank one carries a step that is not a treasury move. Every hop after it
 * is DeBank-to-DeBank and comparable.
 *
 * The exception is a day the DeBank half failed: that date is filled by RPC instead
 * and shows the step twice, in and out. So anything computing a return over
 * consecutive dates should check `source` on both ends of the hop rather than assume
 * the series is uniform.
 *
 * A cache run therefore shows up as two or more processes: one parent that reads the
 * store and persists, and a child per chunk of dates that does the actual work. That
 * is the intended shape, not a double run - every date is computed once, in one child.
 *
 * There is no lock around the store. Sequential runs are idempotent (a second run the
 * same day finds no gaps and does nothing), but two OVERLAPPING runs will both compute
 * the same dates and the later write wins, so a scheduled job should not be able to
 * start on top of a still-running backfill.
 *
 * Dates are YYYY-MM-DD at 00:00:00 UTC; replay mode also takes a unix timestamp.
 *
 * RECORD SHAPE
 *
 * One record per date. The top level is the WITHOUT-double-counting figure - the same
 * thing the adapter publishes - and `curated` is the delta that was left out of it:
 *
 *   { date, timestamp, tvl, chains, breakdown: { client, denom, protocol },
 *     tokens, curated: { tvl, chains, breakdown, tokens } }
 *
 * (`chain` is the top-level `chains` map, not a breakdown dim.)
 *
 * so with-double-counting is `tvl + curated.tvl`, and the same addition works per
 * chain, per denomination, per protocol and per client. `curated` is the mandate
 * Safes' holdings of kpk-curated vaults (Morpho / Euler / Gearbox / Aleph): real
 * client assets, but assets whose TVL is already reported by the vault itself, so
 * adding them to the adapter total would count the same deposit twice.
 *
 * DEBANK REPORT SHAPE (--debank --shape=report, and `positions` in --report)
 *
 * One document instead of per-address NDJSON:
 *
 *   { source, asOf, date, timestamp, tvl, chains, tokens,
 *     breakdown: { chain, client, denom, protocol },
 *     clients:   { "<client>": { tvl, safes, mandates, chains, protocol, denom,
 *                                tokens, curatedUsd, rewardsUsd, ... } },
 *     totals, positions[], unpriced[], failed }
 *
 * It is built on the single flat `positions` array, where every row is one position -
 * a protocol position OR an idle wallet token. So `sum(positions[].usd) === tvl` and
 * every map above is a pure groupBy over that array. Yields are deliberately out of
 * scope, and this is what keeps adding them cheap: an APY is a new field on a row that
 * already carries the join keys for it (pool + protocolId + chain), and a weighted
 * rollup is one more groupBy. `assets[].amount` stays in native units for the same
 * reason - yield measured in token terms is immune to price moves.
 *
 * The invariants are asserted on every report and printed to stderr; a violation exits
 * 1. See checkReport().
 *
 * Two things the report says that DeBank's raw payload does not:
 *   - `curated: true` marks a kpk-curated vault position. The adapter above blacklists
 *     these (curated vault TVL is reported separately), this view counts them and tags
 *     them, so the two figures reconcile by one filter - around $20M today.
 *   - `rewards[].counted: false` marks claimable rewards DeBank leaves OUT of
 *     net_usd_value, and so out of tvl (Uniswap V3 fees, Nexus / Aave V2 / Polygon
 *     staking). Reported, never re-added.
 *
 * Every rollup but one is directly diffable against a replay record. The exception is
 * `tokens`: DeBank decomposes positions to their UNDERLYING assets, so the keys here
 * are USDC / WXDAI where a replay record's are the receipt tokens actually held
 * (aEthUSDC, sDAI, fUSDC).
 *
 * COMBINED DOCUMENT (--report)
 *
 *   { generatedAt, window: { from, to, dates, gaps, sources, provisional, seam },
 *     chart: [ <record>, ... ], positions: <debank report> }
 *
 * `chart` is the cached daily history, one record per stored date in the window. Each
 * carries the source it was stored with - `source: "rpc"` for a replayed date, and
 * `source: "debank"` for the latest day when a cache run stood DeBank in for it.
 * Unless --rpc-only, the DeBank read takes the latest day
 * as one more point in the same shape - tagged `source: "debank"`, `provisional: true`,
 * curated positions filtered out so it means what the RPC records mean - REPLACING a
 * same-date RPC record rather than deferring to it. An RPC record is a 00:00:00 UTC
 * snapshot and can be most of a day stale; DeBank is now.
 *
 * That point does not sit flush with its neighbours. Ex-curated, DeBank runs 1.4-2.0%
 * ABOVE the on-chain figure per client (measured 2026-08-31; claimable rewards explain
 * $248 of it, the rest is DeBank's price feed against DefiLlama's), so the last hop of
 * the chart carries a step that is not a treasury move - and the point revises DOWN
 * once it stops being newest and its RPC record takes over. The series therefore ends
 * in a recurring up-tick that is a source artefact. That is the price of a current
 * last point; --rpc-only pays the other one, a homogeneous series up to a day stale.
 *
 * `window.seam` states the size of that step, but read `seam.gapDays` before trusting
 * it: only a SAME-DATE RPC record (gapDays 0) measures the source difference on its
 * own. Compared against an earlier date the number is that difference plus real
 * movement, and the two cannot be separated from here - on 2026-08-31 the same-date
 * gap was +1.42% while the one-day-back gap read -0.07%, a real -1.5% day cancelling
 * it almost exactly.
 *
 * Replay options:
 *   --from=<date>      start of a date range (inclusive)
 *   --to=<date>        end of the range (inclusive, defaults to --from)
 *   --step=<1d|2w|1mo|1y>  range step, default 1d
 *   --eod              use 23:59:59 UTC instead of 00:00:00 UTC for date-only input
 *   --no-tokens        drop the per-token USD breakdown (on by default)
 *   --dims=<list>      breakdown dimensions, comma separated. Replay only - a --cache
 *                      run refuses it, since every stored date needs the full
 *                      breakdown. Defaults to all of
 *                      them: chain, denom, protocol, client.
 *                      protocol/client run the adapter attributed components rather
 *                      than its merged tvl - hundreds of units per date instead of
 *                      one per chain, so a full date takes minutes, not seconds.
 *                      `--dims=chain` is the fast path; `--dims=chain,denom` adds
 *                      denomination for little extra.
 *   --verify           also run the merged tvl and assert it matches the sum of
 *                      components (only meaningful with --dims)
 *   --shape=<ndjson|series>  ndjson (default) = one record per date;
 *                      series = one chart-ready doc, dates on the x axis
 *   --concurrency=<n>  units run in parallel; default 5 for the merged path, 3
 *                      for the component path. Raising it is risky: the adapter
 *                      calls with permitFailure everywhere, so an RPC that starts
 *                      rate-limiting silently returns nulls and the run quietly
 *                      under-reports instead of erroring. Historical runs want an
 *                      archive-capable ETHEREUM_RPC in .env for the same reason.
 *   --out=<file>       also write the result to a file (.csv for CSV, else JSON)
 *
 * Cache options (with --cache):
 *   --to=<date>        window end, default today (UTC)
 *   --from=<date>      window start, default WINDOW_DAYS (365) days before --to
 *   --limit=<n>        stop after n dates; the rest stay missing for the next run
 *   --refill=<list>    re-run these dates even though they are already stored
 *   --refill-stale     re-run entries written by an older breakdown version
 *   --status           print coverage and exit
 *   --dry              list what would run, touch nothing
 *   --no-write         run the dates but do not persist (smoke test)
 *   --allow-partial    store a date even if some components failed (default: skip it,
 *                      leaving the gap for a later run - a half-filled date that looks
 *                      complete is worse than no date at all)
 *   --chunk=<n>        dates per child process, default 20
 *   --no-lock          skip the single-instance lock (see below); only safe if you
 *                      know no other cache run is in flight
 *   --no-debank        fill RPC dates only: no snapshot, and no DeBank record for
 *                      today - today gets an ordinary 00:00 UTC RPC record instead,
 *                      and keeps it. The snapshot is the half that cannot be caught
 *                      up later, so reach for this only when DeBank is what is broken.
 *
 * DeBank options (with --debank or --report):
 *   --list             print the resolved address roster and exit, calling nothing
 *   --client=<list>    only these mandate ids (see --list); default is every mandate
 *                      whose window is open today
 *   --address=<list>   only these addresses; one that is not on the roster is still
 *                      queried, so this doubles as an ad-hoc lookup
 *   --all              include mandates whose window has already closed
 *   --chain=<id>       one DeBank chain id (eth, gno, arb, base, matic, op, bsc, avax).
 *                      Default is every chain DeBank indexes for the address.
 *   --wallet           also fetch idle wallet tokens (token_list), not just the
 *                      protocol positions (complex_protocol_list). Forced on by
 *                      --shape=report and --report: a client breakdown that omits idle
 *                      tokens is wrong, and they run around 8% of the total.
 *   --in=<file>        reshape a saved raw dump instead of calling DeBank - either the
 *                      JSON array --out writes or the NDJSON from stdout. The file
 *                      defines the scope, so an address whose mandate has since closed
 *                      is still reported rather than filtered out by today's window;
 *                      --client / --address narrow it further.
 *   --shape=<raw|report>  --debank only. raw (default) = DeBank's payload, one record
 *                      per address; report = one aggregated document, see REPORT SHAPE
 *                      below. --report has no --shape: its document shape is fixed.
 *
 * Report options (with --report):
 *   --from / --to      chart window, defaulting to the same rolling 365 days as --cache
 *   --live             fetch DeBank now instead of reading the snapshot --cache stored.
 *                      For an ad-hoc look between cache runs; the result is NOT written
 *                      back, only --cache owns the positions key. Without it the
 *                      stored snapshot is used and its age reported, for you to judge.
 *   --rpc-only         leave the chart RPC-sourced; do not use DeBank's point at all
 *                      (the DeBank report is still there, in `positions`)
 *
 * --out, --pretty and --concurrency mean whatever the running mode makes of them:
 * --concurrency is components in flight for replay and cache, addresses in flight
 * (default 3) for the DeBank modes.
 *
 * CONCURRENCY
 *
 * The history is a single object under a single key, so every write is a whole-object
 * put. Two cache runs overlapping would diff against the same snapshot, compute the
 * same dates twice, and the later write would erase the earlier one's dates silently.
 * Two guards, and they are not redundant:
 *   - a lock file in the temp dir, held for the length of a cache run, so a scheduled
 *     run cannot start on top of a still-running backfill (nor a manual run on top of
 *     the job). Local to one host: it does not coordinate across machines.
 *   - saveStore re-reads the store and merges in only the dates the current run
 *     computed, so even an unlocked overlap cannot roll the store backwards.
 *
 * With the default shape, replay writes one JSON record per date to stdout as it
 * completes (NDJSON); progress and errors go to stderr, so `> out.ndjson` stays
 * clean. With --shape=series, stdout gets a single document at the end instead.
 *
 * The DeBank modes need DEBANK_API_KEY in .env (DeBank Pro OpenAPI), unless --in is
 * given. An address DeBank fails on is reported as { ..., error } rather than sinking
 * the run, and the process exits 1 so a caller can tell a partial run from a whole one.
 *
 * Writing to R2 needs R2_ENDPOINT / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY. Without
 * them the sdk silently writes only the local cache folder, so cache mode says which
 * target it actually reached rather than reporting a write that never left the machine.
 */

require("dotenv").config()
const fs = require("fs")
const os = require("os")
const path = require("path")
const readline = require("readline")
const { spawn } = require("child_process")
const axios = require("axios")

process.env.SKIP_RPC_CHECK = "true"

const REPO_ROOT = path.resolve(__dirname, "..", "..")

const sdk = require("@defillama/sdk")
const ADDRESSES = require("../../projects/helper/coreAssets.json")
const { sumTokens2 } = require("../../projects/helper/unwrapLPs")
const deadChains = require("../../projects/helper/deadChains")
const { runInPromisePool } = sdk.util
const { getBlocks } = sdk.util.blocks

// ============================================================================
// Adapter: the on-chain kpk mandate TVL, runnable at any timestamp
// ============================================================================

// ---- kpk-curated vaults: the double-counted set ----
//
// This adapter reports Zodiac-managed treasury mandates only. Curated vault TVL
// (Morpho / Euler / Gearbox / Aleph) is reported separately, so a mandate Safe's
// holding of a kpk vault share must NOT be counted here as well - otherwise the
// same deposit lands in both the mandate figure and the vault figure. These are
// blacklisted out of getSafesTvl for that reason and for no other.
//
// Reporting also wants the other figure - what the client actually holds, curated
// vaults included - so getCuratedVaultTvl() sums exactly this set into the record's
// separate `curated` block. Note the blacklist alone would not produce that split:
// the sweep runs off an explicit token list and none of the Morpho vaults are in it,
// so the shares are excluded by omission and have to be added back deliberately.
//
// The value is the issuing protocol, so the curated delta carries a protocol
// attribution rather than landing in one undifferentiated bucket.
const CURATED_VAULTS = {
  ethereum: {
    "0xe108fbc04852B5df72f9E44d7C29F47e7A993aDd": "Morpho",  // v1 USDC Prime
    "0x0c6aec603d48eBf1cECc7b247a2c3DA08b398DC1": "Morpho",  // v1 EURC Yield
    "0xd564F765F9aD3E7d2d6cA782100795a885e8e7C8": "Morpho",  // v1 ETH Prime
    "0x4Ef53d2cAa51C447fdFEEedee8F07FD1962C9ee6": "Morpho",  // v2 USDC Prime
    "0x1a1985F50352b58090eb36425AfdFacbaC7806F4": "Morpho",  // v2 USDC Prime Core
    "0xa877D5bb0274dcCbA8556154A30E1Ca4021a275f": "Morpho",  // v2 EURC Yield
    "0xbb50a5341368751024ddf33385ba8cf61fe65ff9": "Morpho",  // v2 ETH Prime
    "0x5dbf760b4fd0cDdDe0366b33aEb338b2A6d77725": "Morpho",  // v2 ETH Yield
    "0xc88eFFD6e74D55c78290892809955463468E982A": "Morpho",  // v1 ETH Yield
    "0xD5cCe260E7a755DDf0Fb9cdF06443d593AaeaA13": "Morpho",  // v2 USDC Yield
    "0x9178eBE0691593184c1D785a864B62a326cc3509": "Morpho",  // v1 USDC Yield
    "0xdaD4e51d64c3B65A9d27aD9F3185B09449712065": "Morpho",  // v1 USDT Prime
    "0x870F0BF29A25A40E7CC087cD5C53e70C11F2C8A8": "Morpho",  // v2 USDT Prime
    "0x2B47c128b35DDDcB66Ce2FA5B33c95314a7de245": "Euler",   // kpk USDC Prime RWA (Euler Earn)
    "0xB6D6D89ad4b4D61C15a293e28b74f77F6817fF48": "Euler",   // kpk ETH Yield Term (Euler Earn)
    "0x9396dcbf78fc526bb003665337c5e73b699571ef": "Gearbox", // Gearbox ETH
    "0xA9d17f6D3285208280a1Fd9B94479c62e0AABa64": "Gearbox", // Gearbox wstETH
    "0x9477df934574d47f240e18cd232e013118666690": "Aleph",   // kpk Aleph rETH
    "0xf857caa91ea4007ec26aee2d039e870eb0fa91bf": "Aleph",   // kpk Aleph stETH
    "0x6cbcc646d7422b734c6fc0954a1c3ca87b1b4ceb": "Aleph",   // kpk Aleph osETH
  },
  arbitrum: {
    "0x2C609d9CfC9dda2dB5C128B2a665D921ec53579d": "Morpho",  // USDC Yield
    "0x5837e4189819637853a357aF36650902347F5e73": "Morpho",  // USDC Yield v2
  },
}

// Zodiac-managed institutional safes — each gated to its kpk mandate window (see TIME_GATED_ENTITIES)
const ENS_SAFES = [
  '0x4F2083f5fBede34C2714aFfb3105539775f7FE64', // ENS Endowment Fund (eth)
]
const COW_SAFES = [
  '0x616dE58c011F8736fa20c7Ae5352F7f6FB9F0669', // CoW Main Treasury (eth/gnosis/arb/base/polygon)
  '0x7F8987D6A8bee31bD7bE80E877732579E2582a28', // CoW Defense Fund (eth/gnosis)
  '0x9009B4411D0e1171cc042b77D7701f46B737Fdb9', // CoW Validator Safe (gnosis)
  '0x3E2897E71E504B0510Bed7983579280b32ac1CA5', // CoW wallet (eth)
  '0x523732d31b4432bcdd4baad108f7ebe54ad478b0', // CoW wallet (38M COW) (eth)
]
const ARBITRUM_SAFES = [
  '0x4D1D9D7741740A3E2ffC5507aC643DbA5e81cAe5', // Arbitrum DAO (arb)
]
const NEXUS_SAFES = [
  '0x8e53D04644E9ab0412a8c6bd228C84da7664cFE3', // Nexus Mutual (eth)
]
// same Safe address on eth/gnosis/arbitrum/polygon/avax/optimism; Zodiac Roles
// modifier 0x13c61a25DB73e7a94a244bD2205aDba8b4a60F4a enabled 2024-08-21
const BALANCER_SAFES = [
  '0x0EFcCBb9E2C09Ea29551879bd9Da32362b32fc89', // Balancer DAO treasury
]

// dYdX is the one mandate that is mostly NOT on an EVM chain: 12 of its 16 tracked
// positions are cosmos-dydx / osmosis wallets and dYdX staking, which this adapter
// cannot reach. Only the EVM side is counted here, so the dYdX client figure is a
// deliberate undercount of that mandate - do not read it as dYdX's total AUM.
// These are also plain EOAs, not Zodiac Safes, so there is no module-enable event
// to date the mandate from; `start` below is first observed EVM activity instead.
const DYDX_SAFES = [
  '0xe7f2C930d6c64B91b96cd46C2933885765810A8E', // dYdX wallet (ethereum, arbitrum)
  '0xd97eCe4a24C4538d96E14296c5544c871caE2eEB', // dYdX wallet (ethereum) - USDY + kpk USDC Prime Core V2
]

const AAVE_DAO_SAFES = [
  '0x205e795336610f5131be52f09218af19f0f3ec60',
  '0xa1c93d2687f7014aaf588c764e3ce80af016229b',
  '0xcdb4fa6ba08bf1fb7aa9fdf6002e78edc431a642',
  '0x2ce01c87fec1b71a9041c52caed46fc5f4807285',
  '0xa9e777d56c0ad861f6a03967e080e767ad8d39b6',
  '0xcaf8155d99a0d11567f039422bb8a0ba003788e5',
  '0x25f2226b597e8f9514b3f68f00f494cf4f286491',
  '0x464c71f6c2f760dda6093dcb91c24c39e5d6e18c',
  '0xB2289E329D2F85F1eD31Adbb30eA345278F21bcf',
  '0xBA9424d650A4F5c80a0dA641254d1AcCE2A37057',
  '0x3e652E97ff339B73421f824F5b03d75b62F1Fb51',
  '0x053D55f9B5AF8694c503EB288a1B7E552f590710',
  '0xe8599F3cc5D38a9aD6F3684cd5CEa72f10Dbc383',
  '0x5ba7fd868c40c16f7aDfAe6CF87121E13FC2F7a0',
]
const GNOSIS_DAO_SAFES = [
  '0x458cd345b4c05e8df39d0a07220feb4ec19f5e6f',
  '0x23b4f73fb31e89b27de17f9c5de2660cc1fb0cdf',
  '0x6bbe78ee9e474842dbd4ab4987b3cefe88426a92',
  '0xeb1f08afcc4da307ae4ccef00daf53488aa76979',
  '0x6378a40df79583eaa6ce70e951ba7da45ceb4fc7',
  '0x10720f58cf4a22fa540ff10430fd967d2ef102de',
  '0x9065a0f9545817d18b58436771b4d87bda8f008b',
  '0x509ad7278a2f6530bc24590c83e93faf8fd46e99',
  '0x1a3221e5a1daf12b39bfff0ef8a066029e50e6fe',
  '0x095e194302e851e1ddbd2795c0180b889ad01fef',
  '0x12dbe8705144fdbed126c818fc60faf5d679112b',
  '0x2730a02aef900520104adc8fd76b03e8c4be4bbb',
  '0x8cdb8ae1f5bb1d7d509c28685864ed70669cc63d',
  '0x49e8d6cbc93b36d356266d2e93ddee7fe475125f',
  '0xbf751b5a46c80930f4596d6bc72da81c2ec2b235',
  '0xb5695594f30b9a10889f30108248f8cfda43341b',
  '0x43e2e12a8c294657d94fe80bda9dd380e0598f4c',
  '0x8cc90c889b6e108976d3f66b5292570637350c7d',
  '0x87b6a922794a223eca493fb65dcaf44462843c2a',
  '0xeb5cd25a3855d21e3db6c5ccd8e78d43258aabe8',
  '0xca308c6b015f9ba3625d576a02e96d7cec58b932',
  '0x07643179f63f1e10c6ca04cccc6aba2db71fd60a',
  '0x849d52316331967b6ff1198e5e32a0eb168d039d',
  '0xf51842ebf4dc1e6f89d74ab0768c670ab04d928b',
  '0x2923c1b5313f7375fdaee80b7745106debc1b53e',
  '0xa5c629e04e563355c30885b62928fd6e03558548',
  '0x15a954001bb47890a4c46a7fe9f06f7c39ff3d68',
  '0xce0ef49b8fcd85531327abeabad10ea641299365',
  '0x7eea4286e9e82ba332f49400d037609bb1cf00da',
  '0x5b6e1acd8494092c166b390c17f09694b9ddb42c',
  '0x210ff2e26599d7146753bcbbc93afedf82d2802f',
  '0x7ce63a765341bc274fd5c5c4d80b17ac26f2062f',
  '0x3115f77805fe59ef9a31d5b38c68c171665cbb53',
]
const SAFE_GNOSIS_SAFES = [
  '0xd28b432f06cb64692379758b88b5fcdfc4f56922','0x0c6eeb232800fb86215438c4f7ae032b5463586c', '0x027e1CbF2C299CBa5eB8A2584910d04f1A8Aa403'
]

const ZODIAC_CHAINS = ['ethereum', 'xdai', 'arbitrum', 'base', 'polygon', 'optimism', 'bsc', 'avax']

// see CURATED_VAULTS: excluded so a mandate Safe's vault shares aren't counted
// both here and in the separately-reported curated vault TVL
const getCuratedVaults = (chain) => Object.keys(CURATED_VAULTS[chain] || {})

// held directly, added via sumTokens
const PROTOCOL_TOKENS = {
  ethereum: [
    // --- LSD / LRT (ERC20) ---
    '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84', // stETH
    '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0', // wstETH
    '0xae78736Cd615f374D3085123A210448E74Fc6393', // rETH
    '0xA35b1B31Ce002FBF2058D22F30f95D405200A15b', // ETHx
    '0xE95A203B1a91a908F9B9CE46459d101078c2c3cb', // ankrETH
    '0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee', // weETH
    '0x35fA164735182de50811E8e2E824cFb9B6118ac2', // eETH
    '0xf1C9acDc66974dFB6dEcB12aA385b9cD01190E38', // osETH
    // --- staked stables (ERC20 / ERC4626) ---
    '0x9D39A5DE30e57443BfF2A8307A4256c8797A3497', // sUSDe (Ethena)
    '0x1202F5C7b4B9E47a1A484E8B270be34dbbC75055', // stUSR (Resolv)
    '0x004626A008B1aCdC4c74ab51644093b155e59A23', // stEUR (Angle)
    '0x83F20F44975D03b1b09e64809B757c47f942BEeA', // sDAI (Maker DSR)
    '0xa3931d71877C0E7a3148CB7Eb4463524FEc27fbD', // sUSDS (Sky SSR)
    '0x1a88Df1cFe15Af22B3c4c783D4e6F7F9e0C1885d', // stkGHO (Aave Staked GHO)
    '0xe1753F2E00940cC31213dd92013cf019dfE4CA1D', // sGHO (Aave Savings GHO)
    '0xBc65ad17c5C0a2A4D159fa5a503f4992c7B545FE', // Spark USDC Vault
    '0x28b3a8FB53b741A8Fd78c0Fb9A6b2393D896A43d', // spUSDC (Spark Savings USDC)
    '0xdA89af5bF2eb0B225d787aBfA9095610f2E79e7D', // Upshift Resolv USR Maxi
    '0xBC6736d346a5eBC0dEbc997397912CD9b8FAe10a', // Pendle PT-USDe-25SEP2025
    '0x80ac24aA929eaF5013f6436cdA2a7ba190f5Cc0b', // syrupUSDC (Maple)
    '0xcafeaa466736aC01E0aC9ca72644BeF348694731', // Nexus RWI vault (unpriced, see RECEIPT_VAULTS)
    '0x9Fb7b4477576Fe5B32be4C1843aFB1e55F251B33', // Fluid fUSDC
    '0x5C20B550819128074FD538Edf79791733ccEdd18', // Fluid fUSDT
    '0x6A29A46E21C730DcA1d8b23d637c101cec605C5B', // Fluid fGHO
    '0xc3d688B66703497DAA19211EEdff47f25384cdc3', // CompoundV3 cUSDCv3
    '0xA17581A9E3356d9A858b789D68B4d866e593aE94', // CompoundV3 cWETHv3
    '0x3Afdc9BCA9213A35503b077a6072F3D0d5AB0840', // CompoundV3 cUSDTv3
    '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643', // CompoundV2 cDAI (ENS supply)
    '0x39AA39c021dfbaE8faC545936693aC917d5E7563', // CompoundV2 cUSDC (ENS supply)
    // --- LP / BPT / CoW-AMM (resolveLP) ---
    '0x05ff47AFADa98a98982113758878F9A8B9FddA0a', // weETH/rETH
    '0x06966b4Ae338CE20f283086914388133F27D1d3e', // 50wstETH/25WBTC/25SOL (CoW AMM)
    '0x1e19cf2d73a72ef1332c882f20534b6519be0276', // rETH/WETH
    '0x32296969ef14eb0c6d29669c550d4a0449130230', // wstETH/WETH
    '0x41503C9D499ddbd1dCdf818a1b05e9774203Bf46', // wstETH/bb-a-WETH
    '0x6fF0531EE19272675b3c7d30401A5b2b2C7b0c67', // COW/WETH (CoW AMM)
    '0x75eB3D7976f0bf848F4Bc22a7563fA50BD73c504', // wstETH/SOL (CoW AMM)
    '0x85B2b559bC2D21104C4DEFdd6EFcA8A20343361D', // GHO/USDT/USDC (BalancerV3)
    '0x909d829C549e1f1B04adB939D8a641A256f5fe11', // USDC/WETH (CoW AMM)
    '0x92762b42a06dcdddc5b7362cfb01e631c4d44b40', // COW/GNO
    '0x93d199263632a4EF4Bb438F1feB99e57b4b5f0BD', // wstETH/WETH v2
    '0x9bd702E05B9c97E4A4a3E47Df1e0fe7A0C26d2F1', // COW/wstETH (CoW AMM)
    '0xDACf5Fa19b1f720111609043ac67A9818262850c', // osETH/WETH
    '0xa13a9247ea42d743238089903570127dda72fe44', // bb-a-USD
    '0xbF5e1e2a89312Bc792aFEe22d6bEBdd46Bd1Eae2', // COW/WETH (CoW AMM)
    '0xc9D5204e7c04A1be300B33E3979479bE75132AC5', // USDC/WETH (CoW AMM)
    '0xde8c195aa41c11a0c4787372defbbddaa31306d2', // COW/WETH
    '0xf08D4dEa369C456d26a3168ff0024B904F2d8b91', // USDC/WETH (CoW AMM)
    '0xf25a3b5A965c59f88873Da93FC2a244B00616Be4', // WBTC/wstETH (CoW AMM)
    '0xf4c0dd9b82da36c07605df83c8a416f11724d88b', // GNO/WETH
    '0xfebb0bbf162e64fb9d0dfe186e517d84c395f016', // bb-a-USD v3
    '0xd321300ef77067D4A868F117d37706EB81368E98', // COW/WETH ReClamm (BalancerV3)
    '0x06325440D014e39736583c165C2963BA99fAf14E', // Curve stETH/ETH
    '0xBa3436Fd341F2C8A928452Db3C5A3670d1d5Cc73', // Curve EURA/EURC
    // --- wallet core + gov ---
    ADDRESSES.ethereum.WETH,
    ADDRESSES.ethereum.USDC,
    ADDRESSES.ethereum.USDT,
    ADDRESSES.ethereum.DAI,
    ADDRESSES.ethereum.WBTC,
    '0xDEf1CA1fb7FBcDC777520aa7f396b4E015F497aB', // COW
    '0x6810e776880C02933D47DB1b9fc05908e5386b96', // GNO
    '0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72', // ENS
    '0x0d438F3b5175Bebc262bF23753C1E53d03432bDE', // wNXM
    '0xd7c49CEE7E9188cCa6AD8FF264C1DA2e69D4Cf3B', // NXM (wallet; staked NXM handled separately)
  ],
  xdai: [
    '0x6C76971f98945AE98dD7d4DFcA8711ebea946eA6', // wstETH (gnosis)
    '0xA4eF9Da5BA71Cc0D2e5E877a910A37eC43420445', // sGNO
    '0xaf204776c7245bF4147c2612BF6e5972Ee483701', // sDAI (Gnosis Savings)
    '0x4683e340a8049261057D5aB1b29C8d840E75695e', // Balancer wstETH/GNO
    '0xFEdb19Ec000d38d92Af4B21436870F115db22725', // Balancer bb-ag-USD
    '0xbAd20c15A773bf03ab973302F61FAbceA5101f0A', // Balancer wstETH/WETH
    '0x0CA1C1eC4EBf3CC67a9f545fF90a3795b318cA4a', // Curve EURe/WXDAI/USDC/USDT
    ADDRESSES.xdai.WXDAI,
    '0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb', // GNO (gnosis)
  ],
  arbitrum: [
    '0x10Cab08D1490a56bDa21A191C20771fcB5453F54', // UniV2 COW/WETH
    '0x940098b108fB7D0a7E374f6eDED7760787464609', // Spark USDC Vault (sUSDC)
    '0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf', // CompoundV3 cUSDCv3
    '0xA5EDBDD9646f8dFF606d7448e414884C7d905dCA', // CompoundV3 cUSDbCv3 (USDC.e)
    '0x037dFf1C12805707d7c29F163E0F09fC9102657A', // Fluid fGHO (priced; convertToAssets baked into price)
    '0x4A03F37e7d3fC243e3f99341d36f4b829BEe5E03', // Fluid fUSDT0
    '0x1A996cb54bb95462040408C06122D45D6Cdb6096', // Fluid fUSDC
    ADDRESSES.arbitrum.WETH,
    ADDRESSES.arbitrum.USDC_CIRCLE,
  ],
  base: [
    '0x155e0971A2392c446be02373A4F4c8dC4266f015', // Aerodrome WETH/COW
    '0xFf028c1eC4559d3Aa2B0859AA582925B5Cc28069', // BalancerV3 COW/WETH ReClamm
    '0x6b2F4eD81Cb5DaAE4aBA9b85D64C00dD3E4605E2', // UniV2 COW/WETH
    '0x8ad02D9DD1705098cf22724390E62dfA6A2dce76', // PancakeSwap WETH/COW
    ADDRESSES.base.WETH,
    ADDRESSES.base.USDC,
  ],
  polygon: [
    ADDRESSES.polygon.WETH,
    ADDRESSES.polygon.USDC_CIRCLE,
  ],
  optimism: [ADDRESSES.optimism.WETH, ADDRESSES.optimism.USDC_CIRCLE],
  bsc: [
    '0x74d4EE4Ca29cA2fb69b31e9cbD4523B707E64662', // PancakeSwap ETH/COW
    ADDRESSES.bsc.WBNB,
    ADDRESSES.bsc.USDC,
  ],
}

// A receipt token sitting in a mandate Safe is a position in whoever issued it,
// not an idle balance, so the protocol dimension should report it there. Maps the
// tokens above to their issuer; anything unmapped (plain assets, gov tokens, and
// the long tail of the per-entity lists) is a genuine wallet holding.
const TOKEN_PROTOCOLS = {
  ethereum: {
    '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84': 'Lido',        // stETH
    '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0': 'Lido',        // wstETH
    '0xae78736Cd615f374D3085123A210448E74Fc6393': 'Rocket Pool', // rETH
    '0xA35b1B31Ce002FBF2058D22F30f95D405200A15b': 'Stader',      // ETHx
    '0xE95A203B1a91a908F9B9CE46459d101078c2c3cb': 'Ankr',        // ankrETH
    '0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee': 'Ether.fi',    // weETH
    '0x35fA164735182de50811E8e2E824cFb9B6118ac2': 'Ether.fi',    // eETH
    '0xf1C9acDc66974dFB6dEcB12aA385b9cD01190E38': 'Stakewise',   // osETH
    '0x9D39A5DE30e57443BfF2A8307A4256c8797A3497': 'Ethena',      // sUSDe
    '0x1202F5C7b4B9E47a1A484E8B270be34dbbC75055': 'Resolv',      // stUSR
    '0x004626A008B1aCdC4c74ab51644093b155e59A23': 'Angle',       // stEUR
    '0x83F20F44975D03b1b09e64809B757c47f942BEeA': 'Maker',       // sDAI (DSR wrapper)
    '0xa3931d71877C0E7a3148CB7Eb4463524FEc27fbD': 'Sky',         // sUSDS
    '0x1a88Df1cFe15Af22B3c4c783D4e6F7F9e0C1885d': 'Aave',        // stkGHO
    '0xcafeaa466736aC01E0aC9ca72644BeF348694731': 'Nexus Mutual', // RWI vault
    '0xe1753F2E00940cC31213dd92013cf019dfE4CA1D': 'Aave',        // sGHO
    '0x4da27a545c0c5B758a6BA100e3a049001de870f5': 'Aave',        // stkAAVE
    '0xBc65ad17c5C0a2A4D159fa5a503f4992c7B545FE': 'Spark',       // Spark USDC Vault
    '0x28b3a8FB53b741A8Fd78c0Fb9A6b2393D896A43d': 'Spark',       // spUSDC
    '0xdA89af5bF2eb0B225d787aBfA9095610f2E79e7D': 'Upshift',     // Upshift Resolv USR Maxi
    '0xBC6736d346a5eBC0dEbc997397912CD9b8FAe10a': 'Pendle',      // PT-USDe-25SEP2025
    '0x80ac24aA929eaF5013f6436cdA2a7ba190f5Cc0b': 'Maple',       // syrupUSDC
    '0x9Fb7b4477576Fe5B32be4C1843aFB1e55F251B33': 'Fluid',       // fUSDC
    '0x5C20B550819128074FD538Edf79791733ccEdd18': 'Fluid',       // fUSDT
    '0x6A29A46E21C730DcA1d8b23d637c101cec605C5B': 'Fluid',       // fGHO
    '0xc3d688B66703497DAA19211EEdff47f25384cdc3': 'Compound',    // cUSDCv3
    '0xA17581A9E3356d9A858b789D68B4d866e593aE94': 'Compound',    // cWETHv3
    '0x3Afdc9BCA9213A35503b077a6072F3D0d5AB0840': 'Compound',    // cUSDTv3
    '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643': 'Compound',    // cDAI
    '0x39AA39c021dfbaE8faC545936693aC917d5E7563': 'Compound',    // cUSDC
    '0x05ff47AFADa98a98982113758878F9A8B9FddA0a': 'Balancer',    // weETH/rETH
    '0x1e19cf2d73a72ef1332c882f20534b6519be0276': 'Balancer',    // rETH/WETH
    '0x32296969ef14eb0c6d29669c550d4a0449130230': 'Balancer',    // wstETH/WETH
    '0x41503C9D499ddbd1dCdf818a1b05e9774203Bf46': 'Balancer',    // wstETH/bb-a-WETH
    '0x85B2b559bC2D21104C4DEFdd6EFcA8A20343361D': 'Balancer',    // GHO/USDT/USDC
    '0x92762b42a06dcdddc5b7362cfb01e631c4d44b40': 'Balancer',    // COW/GNO
    '0x93d199263632a4EF4Bb438F1feB99e57b4b5f0BD': 'Balancer',    // wstETH/WETH v2
    '0xDACf5Fa19b1f720111609043ac67A9818262850c': 'Balancer',    // osETH/WETH
    '0xa13a9247ea42d743238089903570127dda72fe44': 'Balancer',    // bb-a-USD
    '0xde8c195aa41c11a0c4787372defbbddaa31306d2': 'Balancer',    // COW/WETH
    '0xf4c0dd9b82da36c07605df83c8a416f11724d88b': 'Balancer',    // GNO/WETH
    '0xfebb0bbf162e64fb9d0dfe186e517d84c395f016': 'Balancer',    // bb-a-USD v3
    '0xd321300ef77067D4A868F117d37706EB81368E98': 'Balancer',    // COW/WETH ReClamm
    '0x06966b4Ae338CE20f283086914388133F27D1d3e': 'CoW AMM',     // 50wstETH/25WBTC/25SOL
    '0x6fF0531EE19272675b3c7d30401A5b2b2C7b0c67': 'CoW AMM',     // COW/WETH
    '0x75eB3D7976f0bf848F4Bc22a7563fA50BD73c504': 'CoW AMM',     // wstETH/SOL
    '0x909d829C549e1f1B04adB939D8a641A256f5fe11': 'CoW AMM',     // USDC/WETH
    '0x9bd702E05B9c97E4A4a3E47Df1e0fe7A0C26d2F1': 'CoW AMM',     // COW/wstETH
    '0xbF5e1e2a89312Bc792aFEe22d6bEBdd46Bd1Eae2': 'CoW AMM',     // COW/WETH
    '0xc9D5204e7c04A1be300B33E3979479bE75132AC5': 'CoW AMM',     // USDC/WETH
    '0xf08D4dEa369C456d26a3168ff0024B904F2d8b91': 'CoW AMM',     // USDC/WETH
    '0xf25a3b5A965c59f88873Da93FC2a244B00616Be4': 'CoW AMM',     // WBTC/wstETH
    '0xf8F5B88328DFF3d19E5f4F11A9700293Ac8f638F': 'CoW AMM',     // BAL/WETH
    '0x06325440D014e39736583c165C2963BA99fAf14E': 'Curve',       // stETH/ETH
    '0xBa3436Fd341F2C8A928452Db3C5A3670d1d5Cc73': 'Curve',       // EURA/EURC
    '0xC5c91aea7551095c3E1FF0f94f682c45b347AD73': 'Balancer',    // B-80BAL-20WETH/WETH
    '0xfacd2eC4647df2Cb758F684C2aAAB56A93288f9e': 'Across',      // Across v2 BAL LP
    '0x6f2269797C449bab47f76d095ddAe5ddA4AF98ae': 'Silo',        // Silo BAL
    '0x96F6eF951840721AdBF46Ac996b59E0235CB985C': 'Ondo',        // USDY
  },
  xdai: {
    '0x6C76971f98945AE98dD7d4DFcA8711ebea946eA6': 'Lido',        // wstETH
    '0xA4eF9Da5BA71Cc0D2e5E877a910A37eC43420445': 'Stakewise',   // sGNO
    '0xaf204776c7245bF4147c2612BF6e5972Ee483701': 'Maker',       // sDAI (Gnosis Savings)
    '0x4683e340a8049261057D5aB1b29C8d840E75695e': 'Balancer',    // wstETH/GNO
    '0xFEdb19Ec000d38d92Af4B21436870F115db22725': 'Balancer',    // bb-ag-USD
    '0xbAd20c15A773bf03ab973302F61FAbceA5101f0A': 'Balancer',    // wstETH/WETH
    '0x0CA1C1eC4EBf3CC67a9f545fF90a3795b318cA4a': 'Curve',       // EURe/WXDAI/USDC/USDT
  },
  arbitrum: {
    '0x10Cab08D1490a56bDa21A191C20771fcB5453F54': 'Uniswap',     // COW/WETH
    '0x940098b108fB7D0a7E374f6eDED7760787464609': 'Spark',       // Spark USDC Vault
    '0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf': 'Compound',    // cUSDCv3
    '0xA5EDBDD9646f8dFF606d7448e414884C7d905dCA': 'Compound',    // cUSDbCv3
    '0x037dFf1C12805707d7c29F163E0F09fC9102657A': 'Fluid',       // fGHO
    '0x4A03F37e7d3fC243e3f99341d36f4b829BEe5E03': 'Fluid',       // fUSDT0
    '0x1A996cb54bb95462040408C06122D45D6Cdb6096': 'Fluid',       // fUSDC
    '0x3f09C77B19AD8Bb527355ec32d5ce98421fec2E3': 'Balancer',    // axlBAL/BAL
  },
  base: {
    '0x155e0971A2392c446be02373A4F4c8dC4266f015': 'Aerodrome',   // WETH/COW
    '0xFf028c1eC4559d3Aa2B0859AA582925B5Cc28069': 'Balancer',    // COW/WETH ReClamm
    '0x6b2F4eD81Cb5DaAE4aBA9b85D64C00dD3E4605E2': 'Uniswap',     // COW/WETH
    '0x8ad02D9DD1705098cf22724390E62dfA6A2dce76': 'PancakeSwap', // WETH/COW
  },
  bsc: {
    '0x74d4EE4Ca29cA2fb69b31e9cbD4523B707E64662': 'PancakeSwap', // ETH/COW
  },
}
const WALLET = 'Wallet'

const GNOSIS_DAO_TOKENS = {
  xdai: ['0x02e7e2dd3ba409148a49d5cc9a9034d2f884f245','0x5d7309a01b727d6769153fcb1df5587858d53b9c','0xbdf4488dcf7165788d438b62b4c8a333879b7078','0x28dbd35fd79f48bfa9444d330d14683e7101d817','0x321704900d52f44180068caa73778d5cd60695a6','0x5aa67e24ba8a3fbdc553e308d02377e03ce9e94f','0xf0376d1fafd1ff2f1367546da622ba8f26829d7a','0x1Ad6A0cFF3870b252492597B557F3e61F130663D','0x5fca4cbdc182e40aefbcb91afbde7ad8d3dc18a8','0xc25F6c9622ac3096bcca122272f511b6fF94d898','0xd7b118271b1b7d26c9e044fc927ca31dccb22a5a','0xDBF14bce36F661B29F6c8318a1D8944650c73F38','0xf6be7ad58f4baa454666b0027839a01bcd721ac3','0xFeDBA8b0Ccf72Ba983e5b7b5B4EE5Bc525bae339','0xF38c5b39F29600765849cA38712F302b1522C9B8','0xF48f01DCB2CbB3ee1f6AaB0e742c2D3941039d56','0xB973Ca96a3f0D61045f53255E319AEDb6ED49240','0x66F33Ae36dD80327744207a48122F874634B3adA','0xFEdb19Ec000d38d92Af4B21436870F115db22725','0x21d4c792Ea7E38e0D0819c2011A2b1Cb7252Bd99','0xa99FD9950B5D5dCeEaf4939E221dcA8cA9B938aB','0x388Cae2f7d3704C937313d990298Ba67D70a3709','0xac16c751f4c719a7ad54081a32ab0488b56f0ef4','0xd3078c1568Ece597f2dF457A4Bbf670FB8076e71','0x7aC5bBefAE0459F007891f9Bd245F6beaa91076c','0xA4eF9Da5BA71Cc0D2e5E877a910A37eC43420445','0xE6B448c0345bF6AA52ea3A5f17aabd0e58F23912','0x0CA1C1eC4EBf3CC67a9f545fF90a3795b318cA4a','0xbAd20c15A773bf03ab973302F61FAbceA5101f0A','0xA611A551b95b205ccD9490657aCf7899daee5DB7','0x5C78d05b8ECF97507d1cf70646082c54FaA4dA95','0x6c76971f98945ae98dd7d4dfca8711ebea946ea6','0x5519E2d8A0af0944EA639C6DBAD69A174DE3ECF8','0x2086f52651837600180dE173B09470F54EF74910','0xEb30C85CC528537f5350CF5684Ce6a4538e13394','0x4683e340a8049261057D5aB1b29C8d840E75695e','0x00dF7f58e1Cf932eBe5f54De5970Fb2Bdf0ef06D','0x0C1B9CE6Bf6C01f587C2ee98b0ef4B20C6648753','0x4cdABE9E07ca393943AcFB9286bBbd0D0a310Ff6','0xaf204776c7245bF4147c2612BF6e5972Ee483701','0xDd439304A77f54B1F7854751Ac1169b279591Ef7','0xBc2acf5E821c5c9f8667A36bB1131dAd26Ed64F9','0x870Bb2C024513B5c9A69894dCc65fB5c47e422f3','0x0d80D7f7719407523A09ee2ef7eD573e0eA3487a','0xBB7E99abCCCE01589Ad464Ff698aD139b0705d90','0x7644fa5d0ea14fcf3e813fdf93ca9544f8567655','0x004626A008B1aCdC4c74ab51644093b155e59A23','0x06135A9Ae830476d3a941baE9010B63732a055F4','0x610525b415c1BFAeAB1a3fc3d85D87b92f048221','0x91fD594c46D8B01E62dBDeBed2401dde01817834','0x98f7656A6C09388c646ff423ED82980675a152dD','0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1','0x2a22f9c3b484c3629090FeED35F17Ff8F88f76F0','0x845C8bc94610807fCbaB5dd2bc7aC9DAbaFf3c55','0xa555d5344f6FB6c65da19e403Cb4c1eC4a1a5Ee3','0x592878b920101946Fb5915aB97961bC546f211CC','0xe2343512dcF8a23d81E6cdc2Fac656Db1FF83aA1','0xdccAa73705dC7457bcfb3dAFEe529B30920e3008','0x3889c8b1f064a1a576cab04d5767a00bf2308bd4','0x35c089e2451633df9684564cccfe745aa5f3b465','0xc791240D1F2dEf5938E2031364Ff4ed887133C3d','0xfC095C811fE836Ed12f247BCf042504342B73FB7','0xA639FB3f8C52e10E10a8623616484d41765d5F82','0xD8a772fD2B7872230cCD92EF073bE81De87137D7','0x8DD4df4Ce580b9644437f3375e54f1ab09808228','0x71E1179C5e197FA551BEEC85ca2EF8693c61b85b','0x8189c4c96826D016A99986394103DFa9aE41e7ee','0xf490c80aae5f2616d3e3bda2483e30c4cb21d1a0','0x4b4406Ed8659D03423490D8b62a1639206dA0A7a','0x00025C729A3364FaEf02c7D1F577068d87E90ba6','0x456e1E2CF2F25d451c1603892f8485701cC88189','0x3220c83e953186f2b9ddfc0b5dd69483354edca2','0x2Cd404D9d75436e7d6dDbCcc2fB9cF7C06941BF1','0x079d2094e16210c42457438195042898a3CFF72d','0x6a83c4F5FE2205D84DCDcF9463Fe4C55A25A306b','0x71663f74490673706D7b8860B7D02b7c76160bAe','0xD7f99B1CDa3EeCf6b6eAa8a61ed21d061E745400','0x5089007DEC8E93f891dcB908c9E2Af8d9DEdb72E','0x33C346928eD9249Cf1d5fc16aE32a8CFFa1671AD','0x2f840f1575EE77adAa43415Ac5953F7Db9F8C6ba','0xEe9BFf933aDD313C4289E98dA80fEfbF9d5Cd9Ba','0x3CB4692177525dB38D983DA0445d4EB25C3826dE','0xe0A342ED4e0F0dBe97C4810534CfCB6550EA017D','0x9eeB6be79899CfE45018866A2113c6b77fa96F35','0x8898a1199a36023E9791F445BBF498755A180b7f','0xAD58D2Bc841Cb8e4f8717Cb21e3FB6c95DCBc286','0x5300648b1cFaa951bbC1d56a4457083D92CFa33F','0x809484b8579dC605917B8f94aA284282d5fe375d','0x9248f874AaA2c53AD9324d7A2D033ea133443874','0xeA50f402653c41cAdbaFD1f788341dB7B7F37816','0x272d6BE442E30D7c87390eDEb9B96f1E84cEcD8d','0xD1D7Fa8871d84d0E77020fc28B7Cd5718C446522','0x6e6bb18449fCF15B79EFa2CfA70ACF7593088029','0xB1EeAD6959cb5bB9B20417d6689922523B2B86C3','0xe9aBA835f813ca05E50A6C0ce65D0D74390F7dE7','0x717633A41211C944C7808013b44824C3D9BB63cD','0x889aC9F5c87e6CA075777D5E417b3634D3F84135','0xC2C6A23461FfFC71068a7Cb207336D68c91Fb8bD','0x9D376359b1C4975Aae4907E540C76838547E2Fe2','0x48094F85AEEb2D67D6F1EF2409d600C02859e57c','0xa50085fF1dfa173378e7D26a76117d68D5ebA539','0x70B3b56773aCE43fE86EE1d80CBe03176Cbe4C09','0x663a8C9e88c5cdc565Cc4bF0b2BEC8d862D744a6','0xaa56989Be5E6267fC579919576948DB3e1F10807','0xcE11e14225575945b8E6Dc0D4F2dD4C570f79d9f','0x420CA0f9B9b604cE0fd9C18EF134C705e5Fa3430'],
  ethereum: ['0x00A7BA8Ae7bca0B10A32Ea1f8e2a1Da980c6CAd2','0x3fa73f1e5d8a792c80f426fc8f84fbf7ce9bbcac','0x1e19cf2d73a72ef1332c882f20534b6519be0276','0x32296969ef14eb0c6d29669c550d4a0449130230','0x3dd0843a028c86e0b760b1a76929d1c5ef93a2dd','0x6a5ead5433a50472642cd268e584dafa5a394490','0x92762b42a06dcdddc5b7362cfb01e631c4d44b40','0xcfca23ca9ca720b6e98e3eb9b6aa0ffc4a5c08b9','0xde8c195aa41c11a0c4787372defbbddaa31306d2','0xf4c0dd9b82da36c07605df83c8a416f11724d88b','0x6B175474E89094C44Da98b954EedeAC495271d0F','0x06325440D014e39736583c165C2963BA99fAf14E','0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B','0x845838DF265Dcd2c412A1Dc9e959c7d08537f8a2','0x5c6ee304399dbdb9c8ef030ab642b10820db8f56','0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84','0x5f1f4e50ba51d723f12385a8a9606afc3a0555f5','0xac16927429c5c7af63dd75bc9d8a58c63ffd0147','0xE95A203B1a91a908F9B9CE46459d101078c2c3cb','0xc128a9954e6c874ea3d62ce62b468ba073093f25','0xa13a9247ea42d743238089903570127dda72fe44','0x7B50775383d3D6f0215A8F290f2C9e2eEBBEceb2','0xae78736Cd615f374D3085123A210448E74Fc6393','0xFe2e637202056d30016725477c5da089Ab0A043A','0xd6F3768E62Ef92a9798E5A8cEdD2b78907cEceF9','0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0','0xfebb0bbf162e64fb9d0dfe186e517d84c395f016','0x83F20F44975D03b1b09e64809B757c47f942BEeA','0x41503C9D499ddbd1dCdf818a1b05e9774203Bf46','0xc2B021133D1b0cF07dba696fd5DD89338428225B','0xdf17c739b666B259DA3416d01f0310a6e429f592','0x8353157092ED8Be69a9DF8F95af097bbF33Cb2aF','0xbE19d87Ea6cd5b05bBC34B564291c371dAe96747','0xb79565c01b7Ae53618d9B847b9443aAf4f9011e7','0x1ce8aAfb51e79F6BDc0EF2eBd6fD34b00620f6dB','0x79c58f70905F734641735BC61e45c19dD9Ad60bC','0x6c1edce139291af5b84fb1e496c9747f83e876c9','0x7e01A500805f8A52Fad229b3015AD130A332B7b3','0xa35b1b31ce002fbf2058d22f30f95d405200a15b','0x1a88Df1cFe15Af22B3c4c783D4e6F7F9e0C1885d','0xe6d8d8aC54461b1C5eD15740EEe322043F696C08','0x0a7cb434f96f65972d46a5c1a64a9654dc9959b2','0xB3AC09cd5201569a821d87446A4aF1b202B10aFd','0x39254033945AA2E4809Cc2977E7087BEE48bd7Ab','0xd7e470043241C10970953Bd8374ee6238e77D735','0xf790870ccF6aE66DdC69f68e6d05d446f1a6ad83','0xc4Ce391d82D164c166dF9c8336DDF84206b2F812','0x57c23c58B1D8C3292c15BEcF07c62C5c52457A42','0x4AB7aB316D43345009B2140e0580B072eEc7DF16','0xf1C9acDc66974dFB6dEcB12aA385b9cD01190E38','0xB36Fc5e542cb4fC562a624912f55dA2758998113','0xa1181481bEb2dc5De0DaF2c85392d81C704BF75D','0x040a9562201B2a3456A7c9052D88ce37e994EE9d','0x09fA04Aac9c6d1c6131352EE950CD67ecC6d4fB9','0x6b31a94029fd7840d780191B6D63Fa0D269bd883','0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee','0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7','0xB266274F55e784689e97b7E363B0666d92e6305B','0x3fCBC480f3Bb3ce8379Bb475D95De603f188D9C0','0xc6132FAF04627c8d05d6E759FAbB331Ef2D8F8fD','0xBc65ad17c5C0a2A4D159fa5a503f4992c7B545FE','0xaAFD07D53A7365D3e9fb6F3a3B09EC19676B73Ce','0xf0bb20865277aBd641a307eCe5Ee04E79073416C','0x6d98a2b6cdbf44939362a3e99793339ba2016af4','0x78Fc2c2eD1A4cDb5402365934aE5648aDAd094d0','0x2371e134e3455e0593363cBF89d3b6cf53740618','0x9a8bC3B04b7f3D87cfC09ba407dCED575f2d61D8','0xf00B548f1b69cB5EE559d891E03A196FB5101d4A','0xBEEf050ecd6a16c4e7bfFbB52Ebba7846C4b8cD4','0xAC0F906E433d58FA868F936E8A43230473652885','0x85B2b559bC2D21104C4DEFdd6EFcA8A20343361D','0xdA89af5bF2eb0B225d787aBfA9095610f2E79e7D','0x1202F5C7b4B9E47a1A484E8B270be34dbbC75055','0x924359B91Eae607ba539fF6daB5bB914956ae624','0x9396DCbf78fc526bb003665337C5E73b699571EF','0x856c4Efb76C1D1AE02e20CEB03A2A6a08b0b8dC3','0xF5581dFeFD8Fb0e4aeC526bE659CFaB1f8c781dA','0x5aFE3855358E112B5647B952709E6165e1c1eEEe','0x8c213ee79581ff4984583c6a801e5263418c4b86','0x0001A500A6B18995B03f44bb040A5fFc28E45CB0','0x5a98fcbea516cf06857215779fd812ca3bef1b32'],
  arbitrum: ['0xb86AF5eB59A8e871bfA573FA656123ea86F47c3a','0x45d0736D77A72AE2Bd3c5770878bd85b72895057','0xDa492C29D88FfE9B7cbfA6DC068C2f9befaE851b','0x61B3184be0c95324BF00e0DE12765B5f6Cc6b7cA'],
  optimism: ['0x3C12765d3cFaC132dE161BC6083C886B2Cd94934','0x2C7FA89CC5Ea38d4e5193512b9C10808348Ba74F','0xB12A1Be740B99D845Af98098965af761be6BD7fE','0xeD6d021DcA3d31D63997e4985fa6Eb3A2B745472','0x3fa73f1e5d8a792c80f426fc8f84fbf7ce9bbcac'],
  bsc: ['0x223F6A3B8d087741BF99a2531DC53cd15745eBa7','0x9350470389848979fCdFEd28352Ff9e0C9Aa87e9','0xf9D88D200f3D9B45Bd9f8f3ae124f59a4fbdbae5','0xc170908481E928DfA39DE3D0d31bEa6292692F8e'],
}
const SAFE_GNOSIS_TOKENS = {
  ethereum: ['0x2e7E978DA0C53404a8cf66ED4bA2c7706C07B62a','0x93d199263632a4EF4Bb438F1feB99e57b4b5f0BD','0x1e19cf2d73a72ef1332c882f20534b6519be0276','0xbF8868b754A77E90Ea68ffC0b5B10A7c729457E1','0xAC0F906E433d58FA868F936E8A43230473652885','0x5aFE3855358E112B5647B952709E6165e1c1eEEe'], // last = SAFE
  xdai: ['0xaf204776c7245bF4147c2612BF6e5972Ee483701','0xa9B2234773cc6A4F3A34A770C52c931CbA5C24B2','0x2Cd404D9d75436e7d6dDbCcc2fB9cF7C06941BF1','0x00025C729A3364FaEf02c7D1F577068d87E90ba6','0x33C346928eD9249Cf1d5fc16aE32a8CFFa1671AD','0xAD58D2Bc841Cb8e4f8717Cb21e3FB6c95DCBc286'],
}
const AAVE_DAO_TOKENS = {
  ethereum: ['0x00A7BA8Ae7bca0B10A32Ea1f8e2a1Da980c6CAd2','0x3fa73f1e5d8a792c80f426fc8f84fbf7ce9bbcac','0xac16927429c5c7af63dd75bc9d8a58c63ffd0147','0xD1b5651E55D4CeeD36251c61c50C889B36F6abB5','0xaa0C3f5F7DFD688C6E646F66CD2a6B66ACdbE434','0x6c3f90f043a72fa612cbac8115ee7e52bde6e490', '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', '0x4da27a545c0c5B758a6BA100e3a049001de870f5', '0x6f40d4A6237C257fff2dB00FA0510DeEECd303eb', '0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f'],
}

// BAL-denominated positions specific to the Balancer mandate
const BALANCER_TOKENS = {
  ethereum: [
    '0xba100000625a3754423978a60c9317c58a424e3D', // BAL
    '0xf8F5B88328DFF3d19E5f4F11A9700293Ac8f638F', // BAL/WETH (CoW AMM-638f)
    '0xC5c91aea7551095c3E1FF0f94f682c45b347AD73', // B-80BAL-20WETH/WETH
    '0xfacd2eC4647df2Cb758F684C2aAAB56A93288f9e', // Across v2 BAL LP
    '0x6f2269797C449bab47f76d095ddAe5ddA4AF98ae', // Silo BAL
  ],
  arbitrum: [
    '0x3f09C77B19AD8Bb527355ec32d5ce98421fec2E3', // axlBAL/BAL
  ],
}

// Ondo US Dollar Yield, held by the dYdX mandate
const DYDX_TOKENS = {
  ethereum: ['0x96F6eF951840721AdBF46Ac996b59E0235CB985C'], // USDY
}

const TIME_GATED_ENTITIES = {
  aave:       { safes: AAVE_DAO_SAFES,    tokens: AAVE_DAO_TOKENS,    start: '2023-12-01', end: '2025-07-31' },
  gnosisdao:  { safes: GNOSIS_DAO_SAFES,  tokens: GNOSIS_DAO_TOKENS,  start: '2022-01-01', end: '2025-11-30' },
  safegnosis: { safes: SAFE_GNOSIS_SAFES, tokens: SAFE_GNOSIS_TOKENS, start: '2024-04-01', end: '2025-10-31' },
  ens:        { safes: ENS_SAFES,         tokens: {},                 start: '2023-03-01' },
  cow:        { safes: COW_SAFES,         tokens: {},                 start: '2023-02-01' },
  arbitrum:   { safes: ARBITRUM_SAFES,    tokens: {},                 start: '2025-10-01', end: '2026-04-30' },
  nexus:      { safes: NEXUS_SAFES,       tokens: {},                 start: '2024-11-01' },
  balancer:   { safes: BALANCER_SAFES,    tokens: BALANCER_TOKENS,    start: '2024-08-21' },
  dydx:       { safes: DYDX_SAFES,        tokens: DYDX_TOKENS,        start: '2025-04-22' },
}
const toTs = d => Math.floor(new Date(d).getTime() / 1000)
const isEntityActive = (cfg, ts) => ts >= toTs(cfg.start) && (!cfg.end || ts <= toTs(cfg.end))

function activeSafes(api) {
  const ts = api.timestamp || Math.floor(Date.now() / 1000)
  const safes = []
  for (const cfg of Object.values(TIME_GATED_ENTITIES)) if (isEntityActive(cfg, ts)) safes.push(...cfg.safes)
  return safes
}
// Every token list, NOT gated by the owning mandate's window - unlike activeSafes().
//
// The gate belongs on safes, not on tokens. A token list records which mandate first
// made us aware of a token, but the sweep crosses the whole token list against every
// active safe, so gating the list means a token silently disappears the day an
// unrelated mandate closes. That is not hypothetical: stkAAVE is listed only under
// AAVE_DAO_TOKENS (mandate ended 2025-07-31) and SAFE only under the two Gnosis lists
// (closed 2025-10-31 / 2025-11-30), while Balancer DAO - still active - holds $2.4M of
// stkAAVE and $76k of SAFE today. 179 of the 210 addresses in closed lists appear
// nowhere else, so the same trap is set for any of them.
//
// Un-gating cannot over-count: a balance is only ever read from an active safe, and a
// safe that doesn't hold the token reads zero. It only costs calls.
//
// The lowercase + dedupe is load-bearing, not tidiness:
//   - the sdk lowercases `blacklistedTokens` but NOT the sweep list before filtering
//     (ChainApi.getTokenBalances), so a checksummed entry silently escapes the
//     blacklist. Gearbox ETH is lowercase in CURATED_VAULTS and checksummed in
//     GNOSIS_DAO_TOKENS, so un-gating would double-count it against `curated`.
//   - the lists overlap once unioned (29 addresses on ethereum, 12 on xdai), and
//     sumTokens does not dedupe by default - a repeat is counted once per copy.
function activeTokens(api) {
  const tokens = [...(PROTOCOL_TOKENS[api.chain] || [])]
  for (const cfg of Object.values(TIME_GATED_ENTITIES)) tokens.push(...(cfg.tokens[api.chain] || []))
  return [...new Set(tokens.map((token) => token.toLowerCase()))]
}

// partition the active token list by issuing protocol (see TOKEN_PROTOCOLS); the
// native token and everything unmapped fall into WALLET. Every token lands in
// exactly one group, so the groups still sum to a single sweep of all of them.
function tokenGroups(api) {
  const issuers = TOKEN_PROTOCOLS[api.chain] || {}
  const lookup = Object.fromEntries(Object.entries(issuers).map(([token, protocol]) => [token.toLowerCase(), protocol]))
  const groups = {}
  for (const token of [...activeTokens(api), ADDRESSES.null]) {
    const protocol = lookup[token.toLowerCase()] || WALLET
    ;(groups[protocol] = groups[protocol] || []).push(token)
  }
  return groups
}

async function getSafesTvl(api, owners, tokens) {
  owners = owners || activeSafes(api)
  if (!owners.length) return
  tokens = tokens || [...activeTokens(api), ADDRESSES.null]
  await sumTokens2({
    api,
    owners,
    tokens,
    resolveLP: true,
    blacklistedTokens: getCuratedVaults(api.chain),
    permitFailure: true,
  })
}

async function sumVaultShares(api, owners, vaults) {
  if (!vaults.length || !owners.length) return

  const pairs = []
  for (const vault of vaults) for (const owner of owners) pairs.push({ target: vault, params: owner })
  const shares = await api.multiCall({ abi: 'erc20:balanceOf', calls: pairs, permitFailure: true })

  const held = {}
  pairs.forEach((pair, i) => {
    if (!shares[i] || shares[i] === '0') return
    held[pair.target] = (held[pair.target] || 0n) + BigInt(shares[i])
  })
  const holdings = Object.entries(held)
  if (!holdings.length) return

  const [assets, underlying] = await Promise.all([
    api.multiCall({ abi: 'function convertToAssets(uint256) view returns (uint256)', calls: holdings.map(([vault, total]) => ({ target: vault, params: total.toString() })), permitFailure: true }),
    api.multiCall({ abi: 'address:asset', calls: holdings.map(([vault]) => vault), permitFailure: true }),
  ])
  holdings.forEach(([vault, total], i) => {
    if (assets[i] && underlying[i]) return api.add(underlying[i], assets[i])
    sdk.log(`vault ${vault} on ${api.chain} is not ERC-4626 here, counting ${total} share(s) as the token itself`)
    api.add(vault, total.toString())
  })
}

const getCuratedVaultTvl = (api, owners, vaults) =>
  sumVaultShares(api, owners || activeSafes(api), vaults || getCuratedVaults(api.chain))

const RECEIPT_VAULTS = {
  ethereum: {
    '0xcafeaa466736aC01E0aC9ca72644BeF348694731': 'Nexus Mutual', // Nexus RWI vault (USDC)
  },
}
const getReceiptVaults = (chain) => Object.keys(RECEIPT_VAULTS[chain] || {})

async function unwrapReceiptVaults(api) {
  const vaults = getReceiptVaults(api.chain)
  if (!vaults.length) return
  const balances = {}
  for (const [key, value] of Object.entries(api.getBalances())) {
    const k = key.toLowerCase()
    balances[k] = (balances[k] || 0) + Number(value)
  }
  const held = vaults
    .map((vault) => [vault, Math.floor(balances[`${api.chain}:${vault.toLowerCase()}`] || 0)])
    .filter(([, shares]) => shares > 0)
  if (!held.length) return

  const [assets, underlying] = await Promise.all([
    api.multiCall({ abi: 'function convertToAssets(uint256) view returns (uint256)', calls: held.map(([vault, shares]) => ({ target: vault, params: shares.toString() })), permitFailure: true }),
    api.multiCall({ abi: 'address:asset', calls: held.map(([vault]) => vault), permitFailure: true }),
  ])
  held.forEach(([vault, shares], i) => {
    if (!assets[i] || !underlying[i]) return sdk.log(`receipt vault ${vault} on ${api.chain} did not answer as ERC-4626, leaving ${shares} share(s) unpriced`)
    api.removeTokenBalance(vault)
    api.add(underlying[i], assets[i])
  })
}

const AAVE_V3_POOLS = {
  ethereum: ['0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2', '0x4e033931ad43597d96D6bcc25c280717730B58B1'], // main + Lido
  arbitrum: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
  xdai: '0xb50201558B00496A145fE76f7424749556E326D8',
  base: '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5',
  polygon: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
  avax: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
  optimism: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
}
const SPARK_POOLS = {
  ethereum: '0xC13e21B648A5Ee794902342038FF3aDAB66BE987',
  xdai: '0x2Dae5307c5E3FD1CF5A72Cb6F698f915860607e0',
}

const AAVE_V2_POOLS = {
  ethereum: '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9',
  avax: '0x4F01AeD16D97E3aB5ab2B501154DC9bb0F1A5A2C',
  polygon: '0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf',
  xdai: '0x5E15d5E33d318dCEd84Bfe3F4EACe07909bE6d9c', // Agave (v2 fork) 
}
const AAVE_RESERVE_DATA_ABI = 'function getReserveData(address asset) view returns (tuple(tuple(uint256 data) configuration, uint128 liquidityIndex, uint128 currentLiquidityRate, uint128 variableBorrowIndex, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, uint16 id, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint128 accruedToTreasury, uint128 unbacked, uint128 isolationModeTotalDebt))'
const AAVE_V2_RESERVE_DATA_ABI = 'function getReserveData(address asset) view returns (tuple(tuple(uint256 data) configuration, uint128 liquidityIndex, uint128 variableBorrowIndex, uint128 currentLiquidityRate, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint8 id))'

async function getLendingTvl(api, pools, owners, reserveAbi = AAVE_RESERVE_DATA_ABI) {
  for (const pool of [].concat(pools || [])) {
    if (!pool) continue
    const reserves = await api.call({ target: pool, abi: 'function getReservesList() view returns (address[])', permitFailure: true })
    if (!reserves) continue
    const reserveData = await api.multiCall({ target: pool, abi: reserveAbi, calls: reserves, permitFailure: true })
    const tokens = []
    for (const r of reserveData) if (r) tokens.push(r.aTokenAddress, r.variableDebtTokenAddress)
    await api.sumTokens({ owners, tokens, permitFailure: true })
  }
}

const getAaveV3Tvl = (api, owners) => getLendingTvl(api, AAVE_V3_POOLS[api.chain], owners || activeSafes(api))
const getAaveV2Tvl = (api, owners) => getLendingTvl(api, AAVE_V2_POOLS[api.chain], owners || activeSafes(api), AAVE_V2_RESERVE_DATA_ABI)
const getSparkTvl = (api, owners) => getLendingTvl(api, SPARK_POOLS[api.chain], owners || activeSafes(api))

const UNIV3_NFT = {
  ethereum: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
  xdai: '0xAE8fbE656a77519a7490054274910129c9244FA3',
}
async function getUniV3Tvl(api, owners) {
  const nftAddress = UNIV3_NFT[api.chain]
  if (!nftAddress) return
  const factory = await api.call({ target: nftAddress, abi: 'address:factory', permitFailure: true })
  if (!factory) return // position manager not deployed yet at this (historical) block
  await sumTokens2({ api, owners: owners || activeSafes(api), resolveUniV3: true, uniV3ExtraConfig: { nftAddress } })
}

const STAKEWISE_V3_VAULTS = {
  ethereum: [
    { vault: '0xAC0F906E433d58FA868F936E8A43230473652885', asset: ADDRESSES.ethereum.WETH }, // Genesis Vault - ETH
    { vault: '0xe6d8d8aC54461b1C5eD15740EEe322043F696C08', asset: ADDRESSES.ethereum.WETH }, // Chorus One MEV Max - ETH
    { vault: '0x3fCBC480f3Bb3ce8379Bb475D95De603f188D9C0', asset: ADDRESSES.ethereum.WETH }, // Stakeway Private Vault 1 - ETH
    { vault: '0xB36Fc5e542cb4fC562a624912f55dA2758998113', asset: ADDRESSES.ethereum.WETH }, // Serenita Vault - ETH
    { vault: '0xB266274F55e784689e97b7E363B0666d92e6305B', asset: ADDRESSES.ethereum.WETH }, // Stakewise vault - ETH
    { vault: '0x15639e82D2072fa510e5D2b5F0db361c823bcAd3', asset: ADDRESSES.ethereum.WETH }, // CoW DAO vault - ETH
  ],
  // vault shares are non-transferable (getShares, not balanceOf), so a vault absent
  // here is invisible - being in some mandate's token list does not cover it
  xdai: [
    { vault: '0x4b4406Ed8659D03423490D8b62a1639206dA0A7a', asset: ADDRESSES.xdai.GNO }, // Genesis Vault - GNO
    { vault: '0x00025C729A3364FaEf02c7D1F577068d87E90ba6', asset: ADDRESSES.xdai.GNO }, // CoW validator vault - GNO
    { vault: '0x2Cd404D9d75436e7d6DDbCcc2fB9cF7C06941bF1', asset: ADDRESSES.xdai.GNO }, // CoW validator vault - GNO
  ],
}
async function getStakewiseV3Tvl(api, owners) {
  const vaults = STAKEWISE_V3_VAULTS[api.chain]
  if (!vaults) return
  owners = owners || activeSafes(api)
  for (const { vault, asset } of vaults) {
    const shares = await api.multiCall({ target: vault, abi: 'function getShares(address) view returns (uint256)', calls: owners, permitFailure: true })
    let total = 0n
    for (const s of shares) if (s) total += BigInt(s)
    if (total === 0n) continue
    const assets = await api.call({ target: vault, abi: 'function convertToAssets(uint256) view returns (uint256)', params: [total.toString()], permitFailure: true })
    if (assets) api.add(asset, assets)
  }
}

const SAFE_TOKEN_LOCK = '0x0a7cB434f96F65972D46A5c1A64a9654dC9959b2'
const SAFE_TOKEN = '0x5aFE3855358E112B5647B952709E6165e1c1eEEe'
async function getSafeLockedTvl(api, owners) {
  if (api.chain !== 'ethereum') return
  owners = owners || activeSafes(api)
  const users = await api.multiCall({ target: SAFE_TOKEN_LOCK, abi: 'function getUser(address) view returns (uint96 locked, uint96 unlocked, uint32 unlockStart, uint32 unlockEnd)', calls: owners, permitFailure: true })
  let locked = 0n
  for (const u of users) if (u) locked += BigInt(u.locked || 0)
  if (locked > 0n) api.add(SAFE_TOKEN, locked.toString())
}

// Maker DSR: DAI deposited in the Dai Savings Rate via the DsrManager
// DAI = pieOf(safe) * pot.chi() / 1e27
const DSR_MANAGER = '0x373238337Bfe1146fb49989fc222523f83081dDb'
const MAKER_POT = '0x197E90f9FAD81970bA7976f33CbD77088E5D7cf7'
async function getMakerDsrTvl(api, owners) {
  if (api.chain !== 'ethereum') return
  owners = owners || activeSafes(api)
  const pies = await api.multiCall({ target: DSR_MANAGER, abi: 'function pieOf(address) view returns (uint256)', calls: owners, permitFailure: true })
  let pie = 0n
  for (const p of pies) if (p) pie += BigInt(p)
  if (pie === 0n) return
  const chi = await api.call({ target: MAKER_POT, abi: 'uint256:chi', permitFailure: true })
  if (!chi) return
  api.add(ADDRESSES.ethereum.DAI, (pie * BigInt(chi) / 10n ** 27n).toString())
}

const STAKEDAO_GAUGES = {
  ethereum: [
    { gauge: '0x7f50786A0b15723D741727882ee99a0BF34e3466', underlying: '0xD1b5651E55D4CeeD36251c61c50C889B36F6abB5' }, // sdCRV-gauge -> sdCRV
  ],
}
const SABLIER_STREAMS = {
  ethereum: [
    // CoW DAO -> 10M COW vesting, id 1173 on Sablier Lockup
    { lockup: '0xcf8ce57fa442ba50acbc57147a62ad03873ffa73', id: 1173, asset: '0xDEf1CA1fb7FBcDC777520aa7f396b4E015F497aB' },
  ],
}
async function getSablierTvl(api, owners) {
  const streams = SABLIER_STREAMS[api.chain]
  if (!streams) return
  const ownerSet = new Set((owners || activeSafes(api)).map((owner) => owner.toLowerCase()))
  const senders = await api.multiCall({ abi: 'function getSender(uint256) view returns (address)', calls: streams.map((s) => ({ target: s.lockup, params: [s.id] })), permitFailure: true })
  const ours = streams.filter((_, i) => senders[i] && ownerSet.has(senders[i].toLowerCase()))
  if (!ours.length) return
  const refundable = await api.multiCall({ abi: 'function refundableAmountOf(uint256) view returns (uint128)', calls: ours.map((s) => ({ target: s.lockup, params: [s.id] })), permitFailure: true })
  ours.forEach((stream, i) => { if (refundable[i]) api.add(stream.asset, refundable[i]) })
}

async function getStakeDaoGaugeTvl(api, owners) {
  const gauges = STAKEDAO_GAUGES[api.chain]
  if (!gauges) return
  owners = owners || activeSafes(api)
  const calls = []
  for (const g of gauges) for (const o of owners) calls.push({ target: g.gauge, params: [o], underlying: g.underlying })
  const bals = await api.multiCall({ abi: 'erc20:balanceOf', calls: calls.map((c) => ({ target: c.target, params: c.params })), permitFailure: true })
  bals.forEach((b, i) => { if (b && b !== '0') api.add(calls[i].underlying, b) })
}

const MAKER = {
  cdpManager: '0x5ef30b9986345249bc32d8928B7ee64DE9435E39',
  vat: '0x35D1b3F3D7966A1DFe207aa4514C12a259A0492B',
  proxyRegistry: '0x4678f0a6958e4D2Bc4F1BAF7Bc52E8F3564f3fE4',
  ilkRegistry: '0x5a464C28D19848f44199D003BeF5ecc87d090F87',
}
const ILK_INFO_ABI = 'function info(bytes32) view returns (string name, string symbol, uint256 class, uint256 dec, address gem, address pip, address join, address xlip)'
async function getMakerCdpTvl(api, owners) {
  if (api.chain !== 'ethereum') return
  const safes = owners || activeSafes(api)
  if (!safes.length) return
  const proxies = await api.multiCall({ target: MAKER.proxyRegistry, abi: 'function proxies(address) view returns (address)', calls: safes })
  const guys = safes.concat(proxies.filter((p) => p && !/^0x0+$/.test(p)))
  // discover each owner's CDPs via the manager
  const firsts = await api.multiCall({ target: MAKER.cdpManager, abi: 'function first(address) view returns (uint256)', calls: guys })
  const cdps = []
  for (const f of firsts) {
    let cdp = f
    while (cdp && cdp !== '0') {
      cdps.push(cdp)
      const l = await api.call({ target: MAKER.cdpManager, abi: 'function list(uint256) view returns (uint256 prev, uint256 next)', params: [cdp] })
      cdp = l.next
    }
  }
  if (!cdps.length) return
  const ilks = await api.multiCall({ target: MAKER.cdpManager, abi: 'function ilks(uint256) view returns (bytes32)', calls: cdps })
  const urns = await api.multiCall({ target: MAKER.cdpManager, abi: 'function urns(uint256) view returns (address)', calls: cdps })
  const pos = await api.multiCall({ target: MAKER.vat, abi: 'function urns(bytes32, address) view returns (uint256 ink, uint256 art)', calls: cdps.map((_, i) => ({ params: [ilks[i], urns[i]] })) })
  const ilkState = await api.multiCall({ target: MAKER.vat, abi: 'function ilks(bytes32) view returns (uint256 Art, uint256 rate, uint256 spot, uint256 line, uint256 dust)', calls: ilks.map((ilk) => ({ params: [ilk] })) })
  const info = await api.multiCall({ target: MAKER.ilkRegistry, abi: ILK_INFO_ABI, calls: ilks.map((ilk) => ({ params: [ilk] })) })
  for (let i = 0; i < cdps.length; i++) {
    const ink = BigInt(pos[i].ink)
    if (ink === 0n) continue
    const dec = Number(info[i].dec)
    // vat stores ink as wad (1e18) -> back to gem native decimals
    api.add(info[i].gem, (dec === 18 ? ink : (ink * 10n ** BigInt(dec)) / 10n ** 18n).toString())
    // net out DAI debt = art * rate / 1e27
    const debt = (BigInt(pos[i].art) * BigInt(ilkState[i].rate)) / 10n ** 27n
    if (debt > 0n) api.add(ADDRESSES.ethereum.DAI, (-debt).toString())
  }
}

const AURA_BOOSTER = {
  ethereum: '0xA57b8d98dAE62B26Ec3bcC4a365338157060B234',
  xdai: '0x98Ef32edd24e2c92525E59afc4475C1242a30184',
}
const AURA_POOL_INFO_ABI = 'function poolInfo(uint256) view returns (address lptoken, address token, address gauge, address crvRewards, address stash, bool shutdown)'

async function getAuraTvl(api, owners) {
  const booster = AURA_BOOSTER[api.chain]
  if (!booster) return
  owners = owners || activeSafes(api)
  const bpts = new Set(activeTokens(api).map((a) => a.toLowerCase()))
  const len = await api.call({ target: booster, abi: 'function poolLength() view returns (uint256)', permitFailure: true })
  if (!len) return // Booster not deployed yet at this (historical) block
  const infos = await api.multiCall({ target: booster, abi: AURA_POOL_INFO_ABI, calls: Array.from({ length: Number(len) }, (_, i) => i), permitFailure: true })
  const pools = infos.filter((i) => i && bpts.has(i.lptoken.toLowerCase()))
  const calls = []
  for (const p of pools) for (const owner of owners) calls.push({ bpt: p.lptoken, target: p.crvRewards, params: [owner] })
  const bals = await api.multiCall({ abi: 'erc20:balanceOf', calls: calls.map((c) => ({ target: c.target, params: c.params })), permitFailure: true })
  calls.forEach((c, i) => { if (bals[i] && bals[i] !== '0') api.add(c.bpt, bals[i]) })
}

// Nexus Mutual staked NXM — find the safe's StakingNFTs, then let Nexus's own
// StakingViewer report each position's active stake (in NXM).
const NEXUS_STAKING_NFT = '0xcafeA508a477D94c502c253A58239fb8F948e97f'
const NEXUS_STAKING_PRODUCTS = '0xcafea573fBd815B5f59e8049E71E554bde3477E4'
const NXM_TOKEN = '0xd7c49CEE7E9188cCa6AD8FF264C1DA2e69D4Cf3B'

async function getNexusStakedNXM(api, safeOwners) {
  if (api.chain !== 'ethereum') return
  const totalSupply = await api.call({ target: NEXUS_STAKING_NFT, abi: 'uint256:totalSupply', permitFailure: true })
  if (!totalSupply) return // contract not deployed at this block

  const ids = Array.from({ length: Number(totalSupply) }, (_, i) => i + 1)
  const owners = await api.multiCall({ target: NEXUS_STAKING_NFT, abi: 'function ownerOf(uint256) view returns (address)', calls: ids, permitFailure: true })
  const safes = new Set((safeOwners || activeSafes(api)).map((a) => a.toLowerCase()))
  const ours = ids.filter((_, i) => owners[i] && safes.has(owners[i].toLowerCase()))
  if (!ours.length) return

  // read stake from the StakingPool contracts since the StakingViewer was deployed later
  const poolIds = await api.multiCall({ target: NEXUS_STAKING_NFT, abi: 'function stakingPoolOf(uint256) view returns (uint256)', calls: ours, permitFailure: true })
  const pools = await api.multiCall({ target: NEXUS_STAKING_PRODUCTS, abi: 'function stakingPool(uint256) view returns (address)', calls: poolIds.map((p) => ({ params: [p] })), permitFailure: true })
  const uniqPools = [...new Set(pools.filter(Boolean))]
  if (!uniqPools.length) return
  const actives = await api.multiCall({ abi: 'uint256:getActiveStake', calls: uniqPools.map((p) => ({ target: p })), permitFailure: true })
  const supplies = await api.multiCall({ abi: 'uint256:getStakeSharesSupply', calls: uniqPools.map((p) => ({ target: p })), permitFailure: true })
  const poolActive = {}, poolSupply = {}
  uniqPools.forEach((p, i) => { poolActive[p] = actives[i]; poolSupply[p] = supplies[i] })
  // deposits sit in 91-day tranches; up to 8 are active at once
  const ts = api.timestamp || Math.floor(Date.now() / 1000)
  const firstTranche = Math.floor(ts / (91 * 86400))
  const calls = []
  ours.forEach((id, i) => { if (pools[i]) for (let t = 0; t < 8; t++) calls.push({ target: pools[i], params: [id, firstTranche + t], pool: pools[i] }) })
  const deps = await api.multiCall({ abi: 'function deposits(uint256, uint256) view returns (uint256 lastAccNxmPerRewardShare, uint256 pendingRewards, uint256 stakeShares, uint256 rewardsShares)', calls: calls.map((c) => ({ target: c.target, params: c.params })), permitFailure: true })
  let nxmWei = 0n
  deps.forEach((d, i) => {
    if (!d || !d.stakeShares || d.stakeShares === '0') return
    const act = poolActive[calls[i].pool], sup = poolSupply[calls[i].pool]
    if (!act || !sup || sup === '0') return
    nxmWei += (BigInt(d.stakeShares) * BigInt(act)) / BigInt(sup)
  })
  if (nxmWei > 0n) api.add(NXM_TOKEN, nxmWei.toString())
}

// ---- Combined TVL export per chain ----

const exportObjects = {
  // mandate assets sit in Aave, Spark, Balancer etc, which count them too
  doublecounted: true,
  methodology:
    "Assets in Safes actively managed by kpk under a Zodiac Roles Modifier mandate: direct holdings plus positions in Aave, Spark, Stakewise, Aura, Uniswap V3, Maker, StakeDAO, Nexus Mutual, Sablier and Safe staking. Each mandate only counts inside its own management window, though token coverage is not window-scoped. kpk-curated vault shares held by a mandate Safe are excluded, since curated vault TVL is reported separately.",
  start: Math.min(...Object.values(TIME_GATED_ENTITIES).map((entity) => toTs(entity.start))),
}

for (const chain of ZODIAC_CHAINS) {
  exportObjects[chain] = {
    tvl: async (api) => {
      // skip base chain before genesis block june 15 2023
      if (chain === 'base' && api.timestamp < 1686800000) return

      await getSafesTvl(api)
      await getAaveV3Tvl(api)
      await getAaveV2Tvl(api)
      await getSparkTvl(api)
      await getStakewiseV3Tvl(api)
      await getAuraTvl(api)
      await getNexusStakedNXM(api)
      await getUniV3Tvl(api)
      await getSafeLockedTvl(api)
      await getMakerDsrTvl(api)
      await getMakerCdpTvl(api)
      await getStakeDaoGaugeTvl(api)
      await getSablierTvl(api)
      await unwrapReceiptVaults(api) // last: it normalises whatever the resolvers left
    }
  }
}

// ---- Attributed component registry (breakdown reporting) ----
//
// The `tvl` exports above merge everything into one balance sheet per chain.
// getComponents() exposes the same work as individually attributed units so a
// reporting run can slice TVL by protocol / client. Every component only
// ever calls api.add over a disjoint owner set, so summing components equals the
// monolithic total for that chain (see --verify in kpkTreasuryIRHistory.js).
//
// Deliberately non-enumerable: test.js reads Object.keys(module) to decide what
// is a chain, and an extra enumerable object export would fail its validation
// once this file moves under projects/.

const CLIENT_LABELS = {
  aave: 'Aave DAO',
  gnosisdao: 'Gnosis DAO',
  safegnosis: 'Safe',
  ens: 'ENS DAO',
  cow: 'CoW DAO',
  arbitrum: 'Arbitrum DAO',
  nexus: 'Nexus Mutual',
  balancer: 'Balancer DAO',
  dydx: 'dYdX',
}

// Zodiac stack, run once per mandate so balances carry a client attribution
const ZODIAC_PARTS = [
  { protocol: 'Aave', id: 'Aave v3', fn: getAaveV3Tvl },
  { protocol: 'Aave', id: 'Aave v2', fn: getAaveV2Tvl },
  { protocol: 'Spark', fn: getSparkTvl },
  { protocol: 'Stakewise', fn: getStakewiseV3Tvl },
  { protocol: 'Aura', fn: getAuraTvl },
  { protocol: 'Nexus Mutual', fn: getNexusStakedNXM },
  { protocol: 'Uniswap', fn: getUniV3Tvl },
  { protocol: 'Safe', fn: getSafeLockedTvl }, // locked SAFE, the only real Safe-protocol position
  { protocol: 'Maker', id: 'Maker DSR', fn: getMakerDsrTvl },
  { protocol: 'Maker', id: 'Maker CDP', fn: getMakerCdpTvl },
  { protocol: 'StakeDAO', fn: getStakeDaoGaugeTvl },
  { protocol: 'Sablier', fn: getSablierTvl },
]

// Direct Safe balances, split so each receipt token reports under its issuer and
// the rest under Wallet. One sumTokens per group over the same owners: the token
// lists are disjoint, so the groups sum to what a single getSafesTvl call returns.
function holdingsParts(chain, timestamp) {
  return Object.entries(tokenGroups({ chain, timestamp })).map(([protocol, tokens]) => ({
    protocol,
    id: `${protocol} holdings`,
    fn: (api, safes) => getSafesTvl(api, safes, tokens),
  }))
}

// The curated-vault delta, one part per issuing protocol so it reports as Morpho /
// Euler / Gearbox / Aleph rather than one lump. Opt-in (see getComponents): these
// parts sit OUTSIDE the adapter total, so including them by default would break the
// invariant that components sum to the merged tvl.
function curatedParts(chain) {
  const byProtocol = {}
  for (const [address, protocol] of Object.entries(CURATED_VAULTS[chain] || {}))
    (byProtocol[protocol] = byProtocol[protocol] || []).push(address)
  return Object.entries(byProtocol).map(([protocol, vaults]) => ({
    protocol,
    id: `${protocol} curated`,
    curated: true,
    fn: (api, safes) => getCuratedVaultTvl(api, safes, vaults),
  }))
}


// `byClient: false` collapses the Zodiac stack back to one run per protocol over
// all active safes - same total, ~1/7th the calls, but no client dimension.
// `curated: true` appends the curated-vault parts, each flagged `curated` so a caller
// can keep them out of the total; without it the parts still sum to the merged tvl.
function getComponents(chain, timestamp, { byClient = true, curated = false } = {}) {
  if (!ZODIAC_CHAINS.includes(chain)) return []
  if (chain === 'base' && timestamp < 1686800000) return [] // pre-genesis

  const mandates = byClient
    ? Object.entries(TIME_GATED_ENTITIES).filter(([, entity]) => isEntityActive(entity, timestamp))
      .map(([id, entity]) => ({ client: CLIENT_LABELS[id] || id, safes: entity.safes }))
    : [{ client: undefined, safes: undefined }] // undefined safes -> activeSafes(api)

  const parts = []
  for (const mandate of mandates)
    for (const part of [...holdingsParts(chain, timestamp), ...ZODIAC_PARTS, ...(curated ? curatedParts(chain) : [])])
      parts.push({
        chain,
        protocol: part.protocol,
        client: mandate.client,
        ...(part.curated ? { curated: true } : {}),
        // `id` keeps same-protocol parts (Aave v2/v3) distinct in the unit key
        key: [chain, part.id || part.protocol, mandate.client].filter(Boolean).join(' / '),
        run: async (api) => {
          await part.fn(api, mandate.safes)
          await unwrapReceiptVaults(api)
        },
      })
  return parts
}

Object.defineProperty(exportObjects, 'components', { value: getComponents, enumerable: false })

// The mandate roster itself, for tools that want the safe list rather than a TVL
// number - kpkTreasuryIRdebank.js reads it so the DeBank view and this on-chain
// view can never drift apart. Non-enumerable for the same reason as `components`.
const MANDATE_ROSTER = Object.entries(TIME_GATED_ENTITIES).map(([id, entity]) => ({
  id,
  client: CLIENT_LABELS[id] || id,
  safes: entity.safes,
  start: entity.start,
  end: entity.end,
}))
Object.defineProperty(exportObjects, 'mandates', { value: MANDATE_ROSTER, enumerable: false })

for (const [name, value] of Object.entries({ classifyLeaf, curatedVaults: CURATED_VAULTS, clientLabels: CLIENT_LABELS, tokenProtocols: TOKEN_PROTOCOLS }))
  Object.defineProperty(exportObjects, name, { value, enumerable: false })


// ============================================================================
// Replay: run the adapter at a timestamp
// ============================================================================
// ---- args ----

const flags = {}
const positional = []
for (const arg of process.argv.slice(2)) {
  if (!arg.startsWith("--")) { positional.push(arg); continue }
  const [key, value] = arg.slice(2).split(/=(.*)/s)
  flags[key] = value === undefined ? true : value
}

function usage() {
  const header = fs.readFileSync(__filename, "utf8").split("*/")[0]
  console.error(header.replace(/^#![^\n]*\n/, "").replace(/^\/\*\*\n/, "").replace(/^ ?\* ?/gm, ""))
}

const VALID_DIMS = ["chain", "denom", "protocol", "client"]
const ATTRIBUTED_DIMS = ["protocol", "client"] // these need the component registry
const DIMS = (() => {
  // default to every dimension: a reporting run wants the whole breakdown, and
  // someone who needs it fast can narrow it with --dims=chain
  const asked = flags.dims === true || !flags.dims ? VALID_DIMS.join(",") : flags.dims
  const requested = String(asked).split(",").map((dim) => dim.trim()).filter(Boolean)
  const unknown = requested.filter((dim) => !VALID_DIMS.includes(dim))
  if (unknown.length) throw new Error(`Invalid --dims: ${unknown.join(", ")} (valid: ${VALID_DIMS.join(", ")})`)
  const set = new Set(requested)
  set.components = requested.some((dim) => ATTRIBUTED_DIMS.includes(dim))
  return set
})()

const WANT_TOKENS = !flags["no-tokens"] && String(flags.tokens) !== "false"

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

function toTimestamp(arg) {
  const str = String(arg).trim()
  if (/^\d+$/.test(str)) {
    const num = Number(str)
    return num > 1e12 ? Math.floor(num / 1000) : num // 13+ digits -> milliseconds
  }
  const iso = DATE_ONLY.test(str) ? `${str}T${flags.eod ? "23:59:59" : "00:00:00"}Z` : str
  const ms = Date.parse(iso)
  if (!Number.isFinite(ms)) throw new Error(`Invalid date: ${arg}`)
  return Math.floor(ms / 1000)
}

function parseStep(step = "1d") {
  const match = /^(\d*)(d|w|mo|y)$/.exec(String(step).toLowerCase())
  if (!match) throw new Error(`Invalid --step: ${step} (expected e.g. 1d, 2w, 1mo, 1y)`)
  const count = Number(match[1] || 1)
  if (count < 1) throw new Error(`Invalid --step: ${step} (step must be at least 1)`)
  return { count, unit: match[2] }
}

// month/year steps keep the anchor's day-of-month, clamped to the target month's
// length, so a month-end series (Jan 31, Feb 28, Mar 31...) doesn't drift forward
function addMonths(anchor, months) {
  const date = new Date(anchor.getTime())
  date.setUTCDate(1)
  date.setUTCMonth(anchor.getUTCMonth() + months)
  const daysInMonth = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate()
  date.setUTCDate(Math.min(anchor.getUTCDate(), daysInMonth))
  return date
}

function expandRange(from, to, { count, unit }) {
  const anchor = new Date(from * 1000)
  const timestamps = []
  for (let i = 0; ; i++) {
    let date
    if (unit === "d" || unit === "w") {
      date = new Date(anchor.getTime())
      date.setUTCDate(anchor.getUTCDate() + count * i * (unit === "w" ? 7 : 1))
    } else {
      date = addMonths(anchor, count * i * (unit === "y" ? 12 : 1))
    }
    const timestamp = Math.floor(date.getTime() / 1000)
    if (timestamp > to) return timestamps
    timestamps.push(timestamp)
    if (timestamps.length > 5000) throw new Error("Refusing to expand a range of more than 5000 dates")
  }
}

// ---- run ----

const round = (num) => Math.round(Number(num) * 100) / 100
const sortKeys = (obj) => Object.fromEntries(Object.keys(obj).sort().map((key) => [key, obj[key]]))

async function resolveBlocks(chains, timestamp) {
  try {
    const { chainBlocks } = await getBlocks(timestamp, chains)
    return chainBlocks
  } catch (e) {
    // one chain without a block at this timestamp shouldn't sink the whole date
    console.error(`  batch block lookup failed (${e.message}), retrying per chain`)
    const chainBlocks = {}
    await runInPromisePool({
      items: chains,
      concurrency: 5,
      processor: async (chain) => {
        try {
          chainBlocks[chain] = await sdk.blocks.getBlockNumber(chain, timestamp)
        } catch (err) {
          console.error(`  no block for ${chain}: ${err.message}`)
        }
      },
    })
    return chainBlocks
  }
}

// price each unit through its own Balances; the SDK caches prices per timestamp
// process-wide, so N units at one date still cost one fetch per distinct token
async function priceUnit({ chain, timestamp, block, key, run }) {
  const api = new sdk.ChainApi({ chain, block, timestamp, storedKey: key })
  api.api = api
  const balances = await run(api)
  let priced = api
  if (balances !== undefined) {
    priced = new sdk.Balances({ chain, timestamp })
    priced.addBalances(balances)
  }
  const raw = priced.getBalances()
  return { ...(await priced.getUSDJSONs()), raw }
}

async function runAt(adapter, tasks, chains, timestamp) {
  const iso = new Date(timestamp * 1000).toISOString().slice(0, 19) + "Z"
  console.error(`[${iso}] resolving blocks for ${chains.length} chains...`)
  const chainBlocks = await resolveBlocks(chains, timestamp)

  const failed = {}

  // Two parallel sets of accumulators. `main` is the adapter total, which excludes
  // kpk curated vault shares; `curated` is exactly those shares, reported as a delta
  // so a consumer can present the with-double-counting figure as one addition.
  // Curated units never touch `main`, so record.tvl stays comparable to every date
  // already in the store and --verify (components == merged tvl) still holds.
  const newAcc = () => ({ values: {}, tokens: {}, breakdown: {}, rawByChain: {} })
  const main = newAcc()
  const curated = newAcc()
  const bump = (acc, dim, segment, usd) => {
    if (!segment) return
    acc.breakdown[dim] = acc.breakdown[dim] || {}
    acc.breakdown[dim][segment] = round((acc.breakdown[dim][segment] || 0) + usd)
  }

  // units are either the merged per-chain tvl fns, or the adapter's attributed
  // components when a breakdown beyond `chain` was asked for
  const units = DIMS.components
    ? chains.flatMap((chain) => adapter.components(chain, timestamp, { byClient: DIMS.has("client"), curated: true })
      .map((part) => ({ ...part, timestamp, block: chainBlocks[chain] })))
    : tasks.map((task) => ({
      ...task, timestamp, block: chainBlocks[task.chain],
      run: (api) => task.fn(api, chainBlocks.ethereum, chainBlocks, api),
    }))

  // the merged path runs the adapter's own tvl fns, which have no curated component
  // by design, so the delta comes in as one extra unit per chain that has such vaults
  if (!DIMS.components)
    for (const chain of chains) {
      if (!getCuratedVaults(chain).length) continue
      units.push({
        chain, curated: true, key: `${chain}-curated`, timestamp, block: chainBlocks[chain],
        run: (api) => getCuratedVaultTvl(api),
      })
    }

  if (DIMS.components)
    console.error(`  ${units.length} attributed components across ${chains.length} chains (--dims=chain for a fast run)`)

  let done = 0
  await runInPromisePool({
    items: units,
    concurrency: Number(flags.concurrency) || (DIMS.components ? 3 : 5),
    processor: async (unit) => {
      try {
        const acc = unit.curated ? curated : main
        const { usdTvl, usdTokenBalances, raw } = await priceUnit(unit)
        acc.values[unit.chain] = round((acc.values[unit.chain] || 0) + usdTvl)
        if (DIMS.has("denom")) {
          acc.rawByChain[unit.chain] = acc.rawByChain[unit.chain] || {}
          sdk.util.mergeBalances(acc.rawByChain[unit.chain], raw)
        }
        bump(acc, "protocol", unit.protocol, usdTvl)
        bump(acc, "client", unit.client, usdTvl)
        if (WANT_TOKENS)
          for (const [symbol, usd] of Object.entries(usdTokenBalances))
            acc.tokens[symbol] = round((acc.tokens[symbol] || 0) + usd)
        if (!DIMS.components) console.error(`  ${unit.key.padEnd(20, " ")} ${sdk.humanizeNumber(usdTvl)}`)
      } catch (e) {
        failed[unit.key] = e && e.message ? e.message : String(e)
        console.error(`  ${unit.key} FAILED: ${failed[unit.key]}`)
      }
      if (DIMS.components && ++done % 25 === 0) console.error(`  ...${done}/${units.length}`)
    },
  })

  if (DIMS.components)
    for (const chain of Object.keys(main.values).sort())
      console.error(`  ${chain.padEnd(20, " ")} ${sdk.humanizeNumber(main.values[chain])}`)

  // denomination is a post-pass over merged raw balances: an LP token has to be
  // resolved once per chain, not once per component that happened to hold it
  if (DIMS.has("denom")) {
    for (const [label, acc] of [["denom", main], ["curated", curated]]) {
      for (const [chain, balances] of Object.entries(acc.rawByChain)) {
        const key = label === "denom" ? `denom:${chain}` : `denom:curated:${chain}`
        try {
          const api = new sdk.ChainApi({ chain, block: chainBlocks[chain], timestamp })
          api.api = api
          const { rows } = await pricedRows(chain, timestamp, balances)
          for (const [denom, usd] of Object.entries(await splitByDenomination(api, rows))) bump(acc, "denom", denom, usd)
        } catch (e) {
          failed[key] = e && e.message ? e.message : String(e)
          console.error(`  denomination split failed on ${key}: ${failed[key]}`)
        }
      }
    }
  }

  // same shape for the total and for the curated delta, so a consumer reads one of
  // them or adds the two without a second code path
  const asBlock = (acc) => {
    const block = {
      tvl: round(Object.values(acc.values).reduce((total, value) => total + value, 0)),
      chains: sortKeys(acc.values),
    }
    if (Object.keys(acc.breakdown).length)
      block.breakdown = Object.fromEntries(Object.keys(acc.breakdown).sort().map((dim) => [dim, sortKeys(acc.breakdown[dim])]))
    if (WANT_TOKENS) block.tokens = sortKeys(acc.tokens)
    return block
  }

  const record = { date: iso.slice(0, 10), timestamp, ...asBlock(main) }
  if (Object.keys(failed).length) record.failed = sortKeys(failed)
  record.curated = asBlock(curated)

  for (const [dim, segments] of Object.entries(record.breakdown || {})) {
    const top = Object.entries(segments).sort((a, b) => b[1] - a[1]).filter(([, usd]) => usd)
    console.error(`  by ${dim}: ${top.map(([name, usd]) => `${name} ${sdk.humanizeNumber(usd)}`).join(", ") || "(nothing)"}`)
  }
  console.error(`  curated vaults (excluded from tvl): ${sdk.humanizeNumber(record.curated.tvl)}${record.curated.breakdown ? ` [${Object.entries(record.curated.breakdown.protocol || {}).filter(([, usd]) => usd).map(([name, usd]) => `${name} ${sdk.humanizeNumber(usd)}`).join(", ") || "nothing"}]` : ""}`)
  console.error(`[${iso}] total ${sdk.humanizeNumber(record.tvl)} without / ${sdk.humanizeNumber(record.tvl + record.curated.tvl)} with double counting${record.failed ? ` (${Object.keys(failed).length} unit(s) failed, excluded)` : ""}`)
  if (flags.verify) await verify(record, tasks, chainBlocks, timestamp)
  console.error("")
  return record
}

// the components only ever api.add over disjoint owner sets, so their sum must
// equal the merged tvl for the same block - drift means an attribution bug
async function verify(record, tasks, chainBlocks, timestamp) {
  for (const task of tasks) {
    if (record.failed && record.failed[task.chain]) continue
    let merged
    try {
      const { usdTvl } = await priceUnit({
        chain: task.chain, timestamp, block: chainBlocks[task.chain], key: `verify:${task.key}`,
        run: (api) => task.fn(api, chainBlocks.ethereum, chainBlocks, api),
      })
      merged = usdTvl
    } catch (e) {
      console.error(`  verify ${task.chain}: merged tvl failed (${e.message}), skipped`)
      continue
    }
    const parts = record.chains[task.chain] || 0
    const drift = Math.abs(merged - parts)
    const tolerance = Math.max(1, Math.abs(merged) * 1e-6) // wei-level rounding in linear share->asset conversions
    const verdict = drift <= tolerance ? "ok" : "DRIFT"
    console.error(`  verify ${task.chain.padEnd(10, " ")} merged ${sdk.humanizeNumber(merged)} vs parts ${sdk.humanizeNumber(parts)} -> ${verdict}${verdict === "ok" ? "" : ` (${sdk.humanizeNumber(drift)})`}`)
  }
}

// pivot the per-date records into dates-on-the-x-axis series, the shape a
// stacked area chart wants: series[dimension][segment] is one value per date,
// zero-filled so every segment spans the full x axis
function toSeries(records) {
  const dates = records.map((record) => record.date)
  const doc = {
    asOf: dates[dates.length - 1],
    dates,
    total: records.map((record) => record.tvl),
    series: { chain: {} },
  }
  // the curated delta as a plain series next to the total: with-double-counting is
  // total[i] + curated[i], and stacking it on the total charts both at once
  if (records.some((record) => record.curated))
    doc.curated = records.map((record) => (record.curated || {}).tvl ?? 0)

  const collect = (target, pick) => {
    const segments = [...new Set(records.flatMap((record) => Object.keys(pick(record) || {})))]
    for (const segment of segments)
      target[segment] = records.map((record) => (pick(record) || {})[segment] ?? 0)
  }
  collect(doc.series.chain, (record) => record.chains)

  for (const dim of [...new Set(records.flatMap((record) => Object.keys(record.breakdown || {})))]) {
    doc.series[dim] = {}
    collect(doc.series[dim], (record) => (record.breakdown || {})[dim])
  }

  if (records.some((record) => record.tokens)) {
    doc.series.token = {}
    collect(doc.series.token, (record) => record.tokens)
  }

  const failed = {}
  for (const record of records) if (record.failed) failed[record.date] = record.failed
  if (Object.keys(failed).length) doc.failed = failed
  return doc
}

function writeOut(file, records) {
  const target = path.resolve(process.cwd(), file)
  if (/\.csv$/i.test(target)) {
    const chains = [...new Set(records.flatMap((record) => Object.keys(record.chains)))].sort()
    const rows = [["date", "timestamp", "tvl", "curated", ...chains].join(",")]
    for (const record of records)
      rows.push([record.date, record.timestamp, record.tvl, (record.curated || {}).tvl ?? "", ...chains.map((chain) => record.chains[chain] ?? "")].join(","))
    fs.writeFileSync(target, rows.join("\n") + "\n")
  } else {
    const payload = flags.shape === "series" ? toSeries(records) : records
    fs.writeFileSync(target, JSON.stringify(payload, null, 2) + "\n")
  }
  console.error(`wrote ${records.length} record(s) to ${target}`)
}

async function replay() {
  let timestamps = positional.map(toTimestamp)
  if (flags.from) {
    const from = toTimestamp(flags.from)
    const to = flags.to ? toTimestamp(flags.to) : from
    if (to < from) throw new Error("--to is before --from")
    timestamps.push(...expandRange(from, to, parseStep(flags.step)))
  }
  if (!timestamps.length) {
    usage()
    throw new Error("No dates given")
  }
  timestamps = [...new Set(timestamps)].sort((a, b) => a - b)

  // the adapter is the first half of this file; drop chains the sdk no longer serves
  const adapter = exportObjects
  deadChains.forEach((chain) => delete adapter[chain])

  const tasks = []
  for (const [chain, chainExport] of Object.entries(adapter)) {
    if (typeof chainExport !== "object" || chainExport === null || Array.isArray(chainExport)) continue
    for (const [type, fn] of Object.entries(chainExport))
      if (typeof fn === "function") tasks.push({ chain, type, fn, key: type === "tvl" ? chain : `${chain}-${type}` })
  }
  if (!tasks.length) throw new Error("No tvl functions exported by the adapter")
  const chains = [...new Set(tasks.map((task) => task.chain))]

  console.error(`kpkTreasuryIR: ${chains.length} chains, ${timestamps.length} date(s), dims=${[...DIMS].join("+")}
`)

  if (flags.shape && !["ndjson", "series"].includes(flags.shape))
    throw new Error(`Invalid --shape: ${flags.shape} (expected ndjson or series)`)

  const records = []
  for (const timestamp of timestamps) {
    const record = await runAt(adapter, tasks, chains, timestamp)
    records.push(record)
    // stream per-date records as they land, unless stdout is reserved for the series doc
    if (flags.shape !== "series") process.stdout.write(JSON.stringify(record) + "\n")
  }
  if (flags.shape === "series") process.stdout.write(JSON.stringify(toSeries(records), null, 2) + "\n")
  if (flags.out) writeOut(String(flags.out), records)
}
// ============================================================================
// Denomination split
// ============================================================================
//
// A treasury "by denomination" view is wrong if pool tokens are classified by
// their own symbol: B-50wstETH-50GNO is half ETH and half GNO, not a thing called
// "B-50wstETH-50GNO". This resolves pool and wrapper tokens on-chain to their
// constituents, splits the parent USD value by the constituent value weights,
// and only then classifies the leaves.
//
// Resolves: Balancer v2 (getPoolId -> Vault.getPoolTokens, composable pools skip
// their own BPT), Balancer v3 (pool.getTokenInfo), aTokens
// (UNDERLYING_ASSET_ADDRESS) and ERC-4626 vaults (asset). Anything else is a leaf.
//
// Leaves classify to USD / ETH / BTC / EUR when the symbol says so, otherwise to
// the symbol itself - GNO stays GNO rather than being forced into a fiat bucket.
//
// Resolution is breadth-first with every probe batched through multiCall: one
// round of calls per depth level, not one round per token.
const MAX_DEPTH = 3

// Liquid staking/restaking tokens are named by suffix (wstETH, weETH, OETH) or by a
// short prefix form (ETHx), which an alternation of known names keeps missing. Match
// the shape instead, and carry an explicit deny list for symbols that merely contain
// the letters - ETHIX is a Gnosis community token, not an ETH position.
const NOT_ETH = /^(ethix)$/i
const NOT_USD = /^(usdn)$/i

// order matters: a wrapped-BTC symbol must not be claimed by the ETH rule
const DENOMS = [
  { name: "BTC", match: (symbol) => /btc$/i.test(symbol) || /^w?btc$/i.test(symbol) },
  { name: "ETH", match: (symbol) => !NOT_ETH.test(symbol) && (/eth$/i.test(symbol) || /^eth[0-9x]?$/i.test(symbol)) },
  { name: "EUR", match: (symbol) => /^eur/i.test(symbol) || /eur[a-z]?$/i.test(symbol) },
  { name: "USD", match: (symbol) => !NOT_USD.test(symbol) && (/usd/i.test(symbol) || /^(w?xdai|s?dai|gho|frax|mkusd)$/i.test(symbol)) },
]

// leaves that aren't a recognised denomination keep their own symbol (GNO stays GNO),
// uppercased so the same asset can't appear twice under different casings
function classifyLeaf(symbol) {
  if (!symbol) return "Unknown"
  const denom = DENOMS.find((entry) => entry.match(symbol))
  return denom ? denom.name : symbol.toUpperCase()
}

const POOL_ID = "function getPoolId() view returns (bytes32)"
const POOL_TOKENS_V2 = "function getPoolTokens(bytes32) view returns (address[], uint256[], uint256)"
const TOKEN_INFO_V3 = "function getTokenInfo() view returns (address[] tokens, tuple(uint8 tokenType, address rateProvider, bool paysYieldFees)[] tokenInfo, uint256[] balancesRaw, uint256[] lastBalancesLiveScaled18)"

const stripChain = (key) => (key.includes(":") ? key.slice(key.indexOf(":") + 1) : key)
const isAddress = (value) => /^0x[0-9a-fA-F]{40}$/.test(value || "")
const lower = (value) => String(value || "").toLowerCase()

// getUSDJSONs defaults minTokenUSDValue to 1% of tvl and silently drops every row
// below it, so debug rows must always be requested with an explicit floor of 0
const DEBUG_OPTS = { debug: true, debugOptions: { printTokenTable: false, minTokenUSDValue: 0 } }

/** priced token rows for a balances object, with nothing filtered out */
async function pricedRows(chain, timestamp, balances) {
  const bag = new sdk.Balances({ chain, timestamp })
  bag.addBalances(balances)
  const { usdTvl, debugData } = await bag.getUSDJSONs(DEBUG_OPTS)
  return { usdTvl, rows: ((debugData || {}).tokenData || []).filter((row) => row && row.value) }
}

/**
 * One batched probe round: given addresses, work out which are composite and what
 * they decompose into. Returns { children, symbols } where children maps an
 * address to [[childAddress, rawBalance], ...] (absent = leaf).
 */
async function probe(api, addresses) {
  const children = new Map()
  const symbols = new Map()
  if (!addresses.length) return { children, symbols }

  // --- Balancer v2: pool -> id + vault, then vault.getPoolTokens(id) ---
  const poolIds = await api.multiCall({ abi: POOL_ID, calls: addresses, permitFailure: true })
  const v2 = addresses.filter((_, i) => poolIds[i])
  const v2Ids = poolIds.filter(Boolean)
  let rest = addresses.filter((_, i) => !poolIds[i])

  if (v2.length) {
    const vaults = await api.multiCall({ abi: "address:getVault", calls: v2, permitFailure: true })
    const ok = v2.map((pool, i) => ({ pool, vault: vaults[i], id: v2Ids[i] })).filter((entry) => entry.vault)
    const held = ok.length
      ? await api.multiCall({ abi: POOL_TOKENS_V2, calls: ok.map((entry) => ({ target: entry.vault, params: [entry.id] })), permitFailure: true })
      : []
    ok.forEach((entry, i) => {
      const res = held[i]
      if (!res) return
      // composable pools hold their own BPT as a constituent; counting it double counts
      const pairs = res[0].map((token, j) => [token, res[1][j]]).filter(([token]) => lower(token) !== lower(entry.pool))
      if (pairs.length) children.set(lower(entry.pool), pairs)
    })
    // v2 pools whose decomposition failed fall through to the wrapper probes
    rest = rest.concat(v2.filter((pool) => !children.has(lower(pool))))
  }

  // --- Balancer v3: the pool reports its own tokens and raw balances ---
  if (rest.length) {
    const info = await api.multiCall({ abi: TOKEN_INFO_V3, calls: rest, permitFailure: true })
    const next = []
    rest.forEach((pool, i) => {
      const res = info[i]
      if (res && res.tokens && res.tokens.length) {
        const pairs = res.tokens.map((token, j) => [token, (res.balancesRaw || [])[j] || "0"])
          .filter(([token]) => lower(token) !== lower(pool))
        if (pairs.length) { children.set(lower(pool), pairs); return }
      }
      next.push(pool)
    })
    rest = next
  }

  // --- single-underlying wrappers: aTokens, then ERC-4626 vaults ---
  for (const abi of ["address:UNDERLYING_ASSET_ADDRESS", "address:asset"]) {
    if (!rest.length) break
    const underlying = await api.multiCall({ abi, calls: rest, permitFailure: true })
    const next = []
    rest.forEach((token, i) => {
      const found = underlying[i]
      // value passes straight through a wrapper, so the whole weight follows the
      // underlying - a null balance here would be meaningless, use weight 1 via "1"
      if (isAddress(found) && lower(found) !== lower(token)) children.set(lower(token), [[found, "1"]])
      else next.push(token)
    })
    rest = next
  }

  // symbols for everything newly discovered, so leaves can be classified
  const discovered = [...new Set([...children.values()].flat().map(([token]) => token))]
  if (discovered.length) {
    const syms = await api.multiCall({ abi: "string:symbol", calls: discovered, permitFailure: true })
    discovered.forEach((token, i) => { if (syms[i]) symbols.set(lower(token), syms[i]) })
  }
  return { children, symbols }
}

/**
 * Split each priced row's USD value across denomination buckets.
 *
 * @param api        a ChainApi already pinned to the block being reported on
 * @param rows       priced rows from pricedRows() ({ token, symbol, value })
 * @returns { denomination -> usd }
 */
async function splitByDenomination(api, rows) {
  const symbols = new Map()
  const children = new Map()

  for (const row of rows) if (row.symbol) symbols.set(lower(stripChain(row.token)), row.symbol)

  // breadth-first: one batched probe round per depth level
  let frontier = [...new Set(rows.map((row) => stripChain(row.token)).filter(isAddress))]
  const probed = new Set()
  for (let depth = 0; depth < MAX_DEPTH && frontier.length; depth++) {
    const pending = frontier.filter((address) => !probed.has(lower(address)))
    if (!pending.length) break
    pending.forEach((address) => probed.add(lower(address)))

    let round
    try {
      round = await probe(api, pending)
    } catch (e) {
      sdk.log(`denomination probe failed at depth ${depth}: ${e.message}`)
      break
    }
    for (const [key, value] of round.children) children.set(key, value)
    for (const [key, value] of round.symbols) if (!symbols.has(key)) symbols.set(key, value)
    frontier = [...new Set([...round.children.values()].flat().map(([token]) => token))].filter(isAddress)
  }

  // price every composite's constituents in one pass so weights are value-based
  const constituentValue = await valueConstituents(api, children)

  // walk each root down to leaves, multiplying weights
  const out = {}
  const memo = new Map()
  const weightsFor = (address, depth) => {
    const key = lower(address)
    if (memo.has(key)) return memo.get(key)
    const pairs = children.get(key)
    const leaf = [[classifyLeaf(symbols.get(key)), 1]]
    if (!pairs || depth >= MAX_DEPTH) return leaf

    const values = pairs.map(([token]) => constituentValue.get(`${key}|${lower(token)}`) || 0)
    const total = values.reduce((sum, value) => sum + value, 0)
    // no priced constituents (e.g. a pass-through wrapper) -> weight them equally
    const weights = total > 0 ? values.map((value) => value / total) : pairs.map(() => 1 / pairs.length)

    memo.set(key, leaf) // cycle guard while recursing
    const parts = []
    pairs.forEach(([token], i) => {
      if (!weights[i]) return
      for (const [denom, weight] of weightsFor(token, depth + 1)) parts.push([denom, weight * weights[i]])
    })
    const result = parts.length ? parts : leaf
    memo.set(key, result)
    return result
  }

  for (const row of rows) {
    if (!row.value) continue
    const address = stripChain(row.token)
    const parts = isAddress(address) ? weightsFor(address, 0) : [[classifyLeaf(row.symbol), 1]]
    for (const [denom, weight] of parts) out[denom] = (out[denom] || 0) + row.value * weight
  }
  return out
}

/** USD value of every constituent balance, keyed `parent|child`, in one priced batch */
async function valueConstituents(api, children) {
  const values = new Map()
  const entries = []
  const bag = new sdk.Balances({ chain: api.chain, timestamp: api.timestamp })
  for (const [parent, pairs] of children)
    for (const [token, balance] of pairs) {
      if (!balance || balance === "0") continue
      entries.push({ parent, token })
      bag.add(token, balance)
    }
  if (!entries.length) return values

  // price the whole set once, then read each constituent's unit price back out
  const { debugData } = await bag.getUSDJSONs(DEBUG_OPTS)
  const unit = new Map()
  for (const row of (debugData || {}).tokenData || [])
    unit.set(lower(stripChain(row.token)), { price: row.price, decimals: row.decimals })

  for (const [parent, pairs] of children)
    for (const [token, balance] of pairs) {
      const info = unit.get(lower(token))
      if (!info || !info.price || !balance || balance === "0") continue
      values.set(`${lower(parent)}|${lower(token)}`, (Number(balance) / 10 ** (info.decimals || 0)) * info.price)
    }
  return values
}
// ============================================================================
// Cache mode: keep the daily history in R2 filled
// ============================================================================
// The chart wants a rolling year, so the default window is the WINDOW_DAYS days
// ending at --to (today unless given) rather than a fixed start date - a daily job
// keeps the last year filled without anyone editing a constant. Dates that roll out
// of the window stay in the store; the window only decides what gets (re-)run.
// To reach further back, pass --from: the adapter itself runs from each entity's own
// start in TIME_GATED_ENTITIES (2022 onwards), not from here.
const WINDOW_DAYS = 365

// Bump when a change to the adapter alters what the breakdown means (a protocol or
// client relabel, a component entering or leaving the total). Stored entries carry
// the version they were built with, so --status can tell you which dates predate the
// change and --refill-stale re-runs them.
const BREAKDOWN_VERSION = 3 // 3: `curated` block; un-gated token lists; LP unwrap; sGHO/spUSDC/Pancake/StakeWise/Sablier/RWI coverage

const STORE_KEY = "tvl-adapter-cache/cache/kpk-treasury-ir/daily.json"

// DeBank positions live under their own key, latest-only, overwritten every cache
// run. Deliberately NOT per-date and NOT inside STORE_KEY: a snapshot is ~156KB
// against ~2.5KB for a day's RPC record, so a year of them in the daily store would
// be a ~57MB object - and STORE_KEY is rewritten whole every time a fill run stores
// a single date.
//
// Know what that trades away. DeBank has no historical endpoint, so each overwrite
// is final: once this key moves on, yesterday's position detail is not recoverable
// from here or from anywhere else. Only the rolled-up daily record outlives it.
//
// What DOES outlive it is the rolled-up point a cache run writes into STORE_KEY for
// the latest day - see capturePositions(). That is the only trace of a given day's
// DeBank reading that survives the next run, and only in aggregate.
const POSITIONS_KEY = "tvl-adapter-cache/cache/kpk-treasury-ir/positions.json"
const HAS_R2 = Boolean(process.env.R2_ENDPOINT && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY)

function asDate(value, label) {
  const str = String(value).trim()
  if (!DATE_ONLY.test(str) || !Number.isFinite(Date.parse(`${str}T00:00:00Z`))) throw new Error(`Invalid ${label}: ${value} (expected YYYY-MM-DD)`)
  return str
}
const today = () => new Date().toISOString().slice(0, 10)
const addDays = (date, days) => {
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}
const nextDay = (date) => addDays(date, 1)

function datesBetween(from, to) {
  const dates = []
  for (let date = from; date <= to; date = nextDay(date)) {
    dates.push(date)
    if (dates.length > 5000) throw new Error("Refusing to expand a window of more than 5000 dates")
  }
  return dates
}

// ---- store ----

async function loadStore() {
  const stored = await sdk.cache.readCache(STORE_KEY, { readFromR2Cache: true }).catch(() => null)
  const store = stored && typeof stored === "object" ? stored : {}
  if (!store.dates || typeof store.dates !== "object") store.dates = {}
  return store
}

// The store is one object under one key, so a write is a whole-object put. Writing
// back the snapshot we loaded at startup would erase anything another run committed
// in the meantime, so re-read and merge only the dates THIS run computed. `ownDates`
// wins on conflict (that is the point of --refill); every other date comes from the
// copy we just read, not from our stale snapshot.
//
// This narrows the race to the gap between this read and this write. It does not
// close it - writeCache has no compare-and-swap - so it is a backstop for the lock
// in acquireLock(), not a replacement for it.
async function saveStore(ownDates) {
  const store = await loadStore()
  store.dates = { ...store.dates, ...ownDates }
  store.updatedAt = Math.floor(Date.now() / 1000)
  store.version = BREAKDOWN_VERSION
  const written = await sdk.cache.writeCache(STORE_KEY, store)
  if (!written) throw new Error(`${STORE_KEY} not written - writeCache rejected the payload`)
  return { bytes: written.length, total: Object.keys(store.dates).length }
}

// ---- positions store ----

async function loadPositions() {
  // readCache resolves an absent key to {} rather than throwing, so an empty object
  // means "no snapshot yet" - not "a snapshot that happens to hold nothing". Checking
  // for the positions array rather than truthiness is what keeps those two apart.
  const stored = await sdk.cache.readCache(POSITIONS_KEY, { readFromR2Cache: true }).catch(() => null)
  return stored && typeof stored === "object" && Array.isArray(stored.positions) ? stored : null
}

async function savePositions(document) {
  const written = await sdk.cache.writeCache(POSITIONS_KEY, document)
  if (!written) throw new Error(`${POSITIONS_KEY} not written - writeCache rejected the payload`)
  return written.length
}

// Age in hours, reported wherever a stored snapshot is served. There is deliberately
// no staleness THRESHOLD here: `asOf` is always populated (see buildReport, which
// falls back to now), so any consumer can compute the age and apply whatever tolerance
// it actually has. A constant in this file would only be this script's opinion about
// someone else's tolerance, printed to a command a human has to be running to see.
function positionsAge(document) {
  const asOf = Date.parse(document && document.asOf)
  return Number.isFinite(asOf) ? (Date.now() - asOf) / 3600000 : null
}

// ---- single-instance lock ----
//
// Two overlapping cache runs diff against the same snapshot, compute the same dates
// twice, and then race to write. The merge in saveStore keeps the damage to a stale
// read, but the wasted work is still real, so hold a lock for the whole run.
//
// The lock is a local file: it stops a scheduled run from starting on top of a still
// running backfill, and a manual run from landing on top of the job. It does NOT
// coordinate across machines - if the job can run from more than one host, that needs
// a lock next to the store itself, not here.
const LOCK_FILE = path.join(os.tmpdir(), "kpk-treasury-ir-cache.lock")
const LOCK_MAX_AGE_MS = 36 * 3600 * 1000 // a full-dims backfill is long; only steal well past that
let lockHeld = false

function lockHolder() {
  try {
    return JSON.parse(fs.readFileSync(LOCK_FILE, "utf8"))
  } catch (e) {
    return null // unreadable or malformed - treat as stale rather than deadlocking forever
  }
}

// a lock whose owner died (crash, kill -9) would otherwise block every later run
function staleReason(holder) {
  if (!holder || !holder.pid) return "unreadable lock file"
  const age = Date.now() - (holder.startedAt || 0)
  if (age > LOCK_MAX_AGE_MS) return `held for ${(age / 3600000).toFixed(1)}h, past the ${LOCK_MAX_AGE_MS / 3600000}h limit`
  if (holder.host !== os.hostname()) return null // another machine: cannot probe it, assume alive
  try {
    process.kill(holder.pid, 0) // signal 0 only tests for existence
    return null
  } catch (e) {
    return e.code === "EPERM" ? null : `pid ${holder.pid} is gone`
  }
}

function acquireLock() {
  if (flags["no-lock"]) return console.error("  --no-lock: running without the single-instance lock")
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      // wx fails if the file exists; the create-or-fail is atomic on both win32 and posix
      fs.writeFileSync(LOCK_FILE, JSON.stringify({ pid: process.pid, host: os.hostname(), startedAt: Date.now() }), { flag: "wx" })
      lockHeld = true
      return
    } catch (e) {
      if (e.code !== "EEXIST") throw e
      const holder = lockHolder()
      const stale = staleReason(holder)
      if (!stale)
        throw new Error(
          `another cache run holds ${LOCK_FILE} (pid ${holder.pid} on ${holder.host}, started ${new Date(holder.startedAt).toISOString()}).
` +
          `Wait for it to finish, or pass --no-lock if you are certain it is not running.`)
      console.error(`  clearing stale lock (${stale})`)
      try { fs.unlinkSync(LOCK_FILE) } catch (err) { /* another run cleared it first; retry */ }
    }
  }
  throw new Error(`could not acquire ${LOCK_FILE}`)
}

function releaseLock() {
  if (!lockHeld) return
  lockHeld = false
  try { fs.unlinkSync(LOCK_FILE) } catch (e) { /* already gone */ }
}

// release on the paths that skip the finally: uncaught throw, ctrl-c, kill
process.on("exit", releaseLock)
for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"])
  process.on(signal, () => { releaseLock(); process.exit(130) })

// a record that lost components under-reports; storing it would hide the gap behind a
// plausible-looking number, and nothing would ever go back for it
function recordProblem(record) {
  if (record.failed) return `${Object.keys(record.failed).length} component(s) failed`
  if (!Number.isFinite(record.tvl) || record.tvl <= 0) return `tvl is ${record.tvl}`
  return null
}

// `chain` is the top-level `chains` map, not a breakdown dim; these three are what an
// unnarrowed run produces and what every consumer of the store expects.
const STORED_DIMS = ["client", "denom", "protocol"]

// Separate from recordProblem, and deliberately NOT bypassable by --allow-partial:
// that flag forgives a component that failed, it does not forgive a record of the
// wrong SHAPE. A breakdown-less date would be stamped with the CURRENT version, so
// --refill-stale could never find it again, and a chart built on it plots flat rather
// than empty. The store is shared - it takes whole records or none.
function recordIncomplete(record) {
  const missing = STORED_DIMS.filter((dim) => !(record.breakdown || {})[dim])
  if (missing.length) return `no ${missing.join(" / ")} breakdown - was this run narrowed with --dims?`
  if (!record.tokens) return "no token rollup - was this run given --no-tokens?"
  return null
}

// ---- run ----

function runDates(dates, extraArgs) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [__filename, ...dates, ...extraArgs], { cwd: REPO_ROOT, env: process.env })
    const records = []
    child.stderr.pipe(process.stderr)
    readline.createInterface({ input: child.stdout }).on("line", (line) => {
      const text = line.trim()
      if (!text) return
      try {
        records.push(JSON.parse(text))
      } catch (e) {
        console.error(`  ignoring unparseable stdout line: ${text.slice(0, 120)}`)
      }
    })
    child.on("error", reject)
    child.on("close", (code) => (code === 0 ? resolve(records) : reject(new Error(`replay exited ${code} (${records.length} record(s) before the failure)`))))
  })
}

// The scheduled job, both halves in one run: fill whatever RPC dates are missing,
// then take the DeBank snapshot. These used to be two commands and therefore two
// cron entries, which is one too many for a pair that has to stay in step.
//
// Order matters. RPC goes first because it is the half that CAN be caught up later:
// if the process dies partway, a missed snapshot costs less than a missed backfill.
// And the snapshot runs even when there was no gap to fill, because "nothing to
// fill" is the steady state of a daily job - that is precisely the run that still
// owes a fresh snapshot.
async function fillCache() {
  // A dump is a moment that has already passed. Writing one to the shared key would
  // hand every --report consumer a stale treasury with nothing to mark it stale, so
  // --in is a smoke-test input here and never a source for the stored snapshot.
  if (typeof flags.in === "string" && !flags["no-write"])
    throw new Error("--cache --in=<file> would store a snapshot built from a saved dump. Add --no-write to smoke-test, or drop --in to fetch live.")

  if (flags.status) {
    await fillRpcGaps()
    return reportPositionsStatus()
  }

  // Both halves write STORE_KEY, so one lock covers the run. --dry touches nothing
  // and --no-write has nothing to protect, so neither takes it - and a smoke test
  // holding the lock could fail a real run that started alongside it.
  if (!flags.dry && !flags["no-write"]) acquireLock()

  // DeBank goes FIRST, and not because it matters more - because it is the cheap half
  // (~20 API calls, against minutes of replay per RPC date). Failing fast on it is
  // what makes the fallback work: a snapshot that lands writes today's record, so the
  // RPC fill below sees the date filled and leaves it alone for good; one that does
  // not leaves today an ordinary gap, and the same run fills it by RPC instead.
  //
  // So a DeBank outage costs the latest day its freshness, never the day itself. The
  // price is an RPC record sitting inside an otherwise DeBank-sourced stretch, which
  // is exactly why consumers are told to check `source` at both ends of a hop rather
  // than assume the series is uniform.
  let snapshotError = null
  if (flags["no-debank"]) console.error("--no-debank: snapshot skipped, positions left as they were")
  else if (flags.dry) console.error("--dry: DeBank snapshot not taken; today shown below as a gap")
  else
    try {
      await capturePositions()
    } catch (e) {
      snapshotError = e
      console.error(`\nDeBank snapshot FAILED: ${e.message}`)
      console.error("  carrying on with the RPC fill - today becomes an ordinary gap, one day less fresh")
    }

  await fillRpcGaps()

  // The RPC dates are already persisted, so the snapshot failure is reported on its
  // own rather than being buried under a green exit.
  if (snapshotError) throw snapshotError
}

// The DeBank half: one live read of the roster, rolled up exactly as
// --debank --shape=report rolls it up, written to POSITIONS_KEY for --report to
// render. A failure here throws rather than warning - the RPC dates are already
// persisted incrementally, so the non-zero exit reports the snapshot alone.
async function capturePositions() {
  flags.wallet = true // a client breakdown that omits idle tokens is wrong

  const document = buildReport(await debankRecords({ stream: false }), labels())
  printReport(document) // runs checkReport, and sets a non-zero exit on a broken invariant

  if (flags["no-write"]) return console.error("--no-write: snapshot not persisted")

  const bytes = await savePositions(document)
  console.error(`snapshot stored: ${document.totals.positions} position(s), ${usd(document.tvl)}, ${bytes}B -> ${POSITIONS_KEY}`)
  if (!HAS_R2) console.error("  R2 credentials absent - the snapshot landed in the local sdk cache only")

  // The rolled-up point goes into the daily store as well, because nothing here runs
  // --report: if the freshest reading only ever lived under POSITIONS_KEY, no consumer
  // of the daily history would ever see it.
  //
  // It becomes that date's FINAL record, and that is an accuracy judgement rather than
  // only a freshness one: the adapter in the first half of this file values a HARDCODED
  // component list, so it sees what someone has already registered, where DeBank
  // discovers what the Safes actually hold. RPC stands in only when DeBank failed -
  // see the fallback in fillCache.
  //
  // So a number this store has published never revises afterwards. Two things that
  // costs: the date never gets an on-chain figure to check it against, and the series
  // moves onto DeBank's price feed, which is the other half of what the ~1.4-2.0% seam
  // measures. --refill=<date> is the way back to an on-chain record for a given date.
  //
  // Stored only for TODAY. A snapshot reading any other date is a clock problem or a
  // replayed dump, and neither belongs in a slot the RPC fill will then leave alone.
  const currentDate = today()
  if (document.date !== currentDate) {
    console.error(`  snapshot reads ${document.date}, not ${currentDate} - not stored as a daily record`)
    return
  }

  // chartPointFromReport marks its point provisional because in --report that is what
  // it is: a render-time overlay the stored record outlives. Here it is the opposite,
  // so the flag comes off and `source` is what marks the record for good.
  const { provisional, ...point } = chartPointFromReport(document)
  const { bytes: storeBytes, total } = await saveStore({ [currentDate]: point })
  console.error(
    `  ${currentDate} stored from DeBank: ${usd(point.tvl)} ex-curated, final - ` +
      `store now ${total} date(s), ${storeBytes}B`
  )
}

// --status covers both halves, so one command answers "is the daily job healthy".
async function reportPositionsStatus() {
  const stored = await loadPositions()
  if (!stored) return console.error(`positions ${POSITIONS_KEY} -> nothing stored yet`)

  const hours = positionsAge(stored)
  const age = hours === null ? "no asOf" : `${hours.toFixed(1)}h old`
  console.error(`positions ${POSITIONS_KEY} -> ${stored.date}, ${age}, ${stored.totals.positions} position(s), ${usd(stored.tvl)}`)
}

async function fillRpcGaps() {
  const to = asDate(flags.to || today(), "--to")
  const from = asDate(flags.from || addDays(to, -(WINDOW_DAYS - 1)), "--from")
  if (from > to) throw new Error(`--from (${from}) is after --to (${to})`)

  // Refused rather than forwarded: a narrowed run would write dates the rest of the
  // store cannot be compared against, stamped with the current version so nothing
  // downstream could tell. Narrow a one-off replay instead - that writes to stdout.
  if (flags.dims) throw new Error("--dims cannot narrow a --cache run: every stored date needs the full breakdown. Use replay mode for a fast one-off.")
  if (flags["no-tokens"] || String(flags.tokens) === "false")
    throw new Error("--no-tokens cannot narrow a --cache run: every stored date needs the token rollup. Use replay mode for a fast one-off.")

  const store = await loadStore()
  const window = datesBetween(from, to)
  const refill = new Set(flags.refill && flags.refill !== true ? String(flags.refill).split(",").map((d) => asDate(d, "--refill")) : [])

  // A DeBank-sourced record is that date's final record, not a placeholder waiting on
  // a replay. So it is neither a gap nor stale, and the RPC fill leaves it alone
  // forever - only an explicit --refill=<date> turns one back into a replayed date.
  //
  // Version staleness is a question about the RPC breakdown, which never built these:
  // they carry no `v` and would otherwise read as stale for a reason that cannot
  // apply to them.
  const stale = window.filter(
    (date) =>
      store.dates[date] && store.dates[date].source !== "debank" && (store.dates[date].v || 0) !== BREAKDOWN_VERSION
  )
  if (flags["refill-stale"]) for (const date of stale) refill.add(date)

  // An explicitly asked-for refill goes to the front: `missing` used to be plain
  // chronological, so with a backlog `--refill=X --limit=1` spent the limit on the
  // oldest gap and never touched X. Gaps keep their chronological order behind it.
  const refills = window.filter((date) => store.dates[date] && refill.has(date))
  const gaps = window.filter((date) => !store.dates[date])
  const missing = [...refills, ...gaps]
  const cached = window.filter((date) => store.dates[date]).length

  // a refill outside the window would otherwise be dropped without a word
  const outside = [...refill].filter((date) => date < from || date > to).sort()
  if (outside.length)
    console.error(`  --refill ignored, outside ${from}..${to}: ${outside.join(", ")}`)

  console.error(`store ${STORE_KEY} -> ${Object.keys(store.dates).length} date(s) held, version ${store.version || "?"} (current ${BREAKDOWN_VERSION})`)
  console.error(`window ${from} .. ${to}: ${window.length} day(s), ${cached} cached, ${missing.length} to run${refills.length ? ` (${refills.length} refill first, ${gaps.length} gap)` : ""}${stale.length ? `, ${stale.length} stale` : ""}`)
  if (stale.length && !flags["refill-stale"])
    console.error(`  stale (older breakdown version, kept as-is): ${stale.slice(0, 8).join(", ")}${stale.length > 8 ? ` ... +${stale.length - 8}` : ""}`)
  if (!HAS_R2) console.error("  R2 credentials absent - writes land in the local sdk cache only, nothing reaches R2")

  if (flags.status) return
  if (!missing.length) return console.error("nothing to fill")

  const limit = flags.limit ? Number(flags.limit) : missing.length
  if (!Number.isFinite(limit) || limit < 1) throw new Error(`Invalid --limit: ${flags.limit}`)
  const todo = missing.slice(0, limit)
  if (todo.length < missing.length) console.error(`  --limit=${limit}: running ${todo.length}, leaving ${missing.length - todo.length} for a later run`)

  if (flags.dry) return console.error(`would run: ${todo.join(", ")}`)

  acquireLock()

  const extraArgs = []
  for (const key of ["concurrency"]) if (flags[key]) extraArgs.push(`--${key}=${flags[key]}`)

  const chunkSize = Number(flags.chunk) || 20
  let stored = 0
  const skipped = []
  const startedAt = Date.now()
  const ownDates = {} // only what this run computed, so saveStore never replays a stale snapshot

  for (let i = 0; i < todo.length; i += chunkSize) {
    const chunk = todo.slice(i, i + chunkSize)
    console.error(`\n=== dates ${i + 1}-${i + chunk.length} of ${todo.length}: ${chunk[0]} .. ${chunk[chunk.length - 1]} ===`)
    const records = await runDates(chunk, extraArgs)
    for (const record of records) {
      const incomplete = recordIncomplete(record)
      if (incomplete) {
        skipped.push(`${record.date} (${incomplete})`)
        console.error(`  ${record.date} NOT stored: ${incomplete}`)
        continue
      }
      const problem = recordProblem(record)
      if (problem && !flags["allow-partial"]) {
        skipped.push(`${record.date} (${problem})`)
        console.error(`  ${record.date} NOT stored: ${problem} - leaving the gap for a later run`)
        continue
      }
      ownDates[record.date] = { ...record, v: BREAKDOWN_VERSION }
      store.dates[record.date] = ownDates[record.date]
      stored++
      if (!flags["no-write"]) {
        const { bytes, total } = await saveStore(ownDates)
        console.error(`  ${record.date} stored (${sdk.humanizeNumber(record.tvl)}), cache now ${total} date(s), ${bytes}B`)
      }
    }
  }

  const mins = (Date.now() - startedAt) / 60000
  console.error(`\nfilled ${stored}/${todo.length} date(s) in ${mins.toFixed(1)} min${stored ? ` (${(mins / stored).toFixed(1)} min/date)` : ""}`)
  if (skipped.length) console.error(`skipped ${skipped.length}: ${skipped.join(", ")}`)
  if (flags["no-write"]) console.error("--no-write: nothing was persisted")
  else console.error(`wrote to ${HAS_R2 ? "R2 + local cache" : "local cache only (no R2 credentials)"}`)
}

// ============================================================================
// DeBank: the same mandates, as DeBank sees them right now
// ============================================================================
//
// Everything above reads chains directly and so runs at any past timestamp. This half
// asks DeBank Pro for the CURRENT positions of the same roster instead. DeBank Pro has
// no historical endpoint for these, which is the whole reason the replay half exists -
// so this is the freshest view available and the only one that cannot be backdated.
//
// It is a read of DeBank, not a TVL adapter. Nothing here is netted or reconciled
// against the on-chain figure, so its USD totals will NOT match a replay record; see
// the report-mode note below for the size of the gap and what closes it.

const { getLlamaChain } = require("../../projects/helper/debank")
const { nullAddress } = require("../../projects/helper/sumTokens")

const DEBANK_API = "https://pro-openapi.debank.com/v1/user"

const asList = (value) => (typeof value === "string" ? value.split(",").map((s) => s.trim()).filter(Boolean) : [])
const usd = (num) => "$" + Math.round(num).toLocaleString("en-US")

// ---- roster ----

const NOW = Math.floor(Date.now() / 1000)
const isActive = (mandate) => NOW >= toTs(mandate.start) && (!mandate.end || NOW <= toTs(mandate.end))

// One entry per address, not per mandate: a Safe shared by two mandates is still a
// single DeBank call, and both client labels ride along on the record.
function roster() {
  const wanted = new Set(asList(flags.client).map((id) => id.toLowerCase()))
  const only = new Set(asList(flags.address).map((address) => address.toLowerCase()))

  const unknown = [...wanted].filter((id) => !MANDATE_ROSTER.some((mandate) => mandate.id === id))
  if (unknown.length)
    throw new Error(`Unknown --client: ${unknown.join(", ")} (valid: ${MANDATE_ROSTER.map((m) => m.id).join(", ")})`)

  const byAddress = new Map()
  for (const mandate of MANDATE_ROSTER) {
    const included = wanted.size ? wanted.has(mandate.id) : flags.all || isActive(mandate)
    if (!included) continue
    for (const safe of mandate.safes) {
      const address = safe.toLowerCase()
      if (only.size && !only.has(address)) continue
      const entry = byAddress.get(address) || { address, clients: [], mandates: [] }
      if (!entry.mandates.includes(mandate.id)) {
        entry.mandates.push(mandate.id)
        entry.clients.push(mandate.client)
      }
      byAddress.set(address, entry)
    }
  }
  // an --address off the roster is still worth asking DeBank about
  for (const address of only)
    if (!byAddress.has(address)) byAddress.set(address, { address, clients: [], mandates: [] })

  return [...byAddress.values()]
}

// ---- debank ----

async function debank(endpoint, params, attempt = 1) {
  try {
    const { data } = await axios.get(`${DEBANK_API}/${endpoint}`, {
      params,
      headers: { accept: "application/json", AccessKey: process.env.DEBANK_API_KEY },
      timeout: 60000,
    })
    return data ?? []
  } catch (e) {
    const status = e.response?.status
    // rate limit and transient 5xx are worth another go; a 400/401 never is
    if ((!status || status === 429 || status >= 500) && attempt < 4) {
      const wait = 1000 * 2 ** attempt
      console.error(`  ${endpoint} ${params.id}: ${status || e.code || "no response"}, retrying in ${wait}ms`)
      await new Promise((resolve) => setTimeout(resolve, wait))
      return debank(endpoint, params, attempt + 1)
    }
    const detail = e.response?.data?.message || e.response?.data?.errors || e.message
    throw new Error(`DeBank ${endpoint} failed for ${params.id}: ${[status, JSON.stringify(detail)].filter(Boolean).join(" ")}`)
  }
}

// `all_*` sweeps every chain DeBank indexes; the chain-scoped endpoints take a
// chain_id instead. is_all=false on the token list drops protocol-derived tokens,
// leaving only what is actually idle in the wallet.
async function positionsOf(entry) {
  const chain = typeof flags.chain === "string" ? flags.chain : null

  const protocols = chain
    ? await debank("complex_protocol_list", { id: entry.address, chain_id: chain })
    : await debank("all_complex_protocol_list", { id: entry.address })

  const record = { ...entry, fetchedAt: new Date().toISOString(), protocols }

  if (flags.wallet)
    record.tokens = chain
      ? await debank("token_list", { id: entry.address, chain_id: chain, is_all: false })
      : await debank("all_token_list", { id: entry.address, is_all: false })

  return record
}

// DeBank's own valuation, echoed back for the progress line - not a TVL claim
function debankUsd(record) {
  let total = 0
  for (const protocol of record.protocols || [])
    for (const item of protocol.portfolio_item_list || []) total += Number(item.stats?.net_usd_value) || 0
  for (const token of record.tokens || []) total += (Number(token.amount) || 0) * (Number(token.price) || 0)
  return total
}

async function pool(items, size, worker) {
  let cursor = 0
  const lanes = Array.from({ length: Math.min(size, items.length) }, async () => {
    while (cursor < items.length) await worker(items[cursor++])
  })
  await Promise.all(lanes)
}

// ---- report shape ----
//
// One document instead of per-address NDJSON, built on a single flat `positions`
// array. Every row is one position - a protocol position OR an idle wallet token -
// so `sum(positions[].usd) === tvl`, and every rollup below is a pure groupBy over
// that array. That is the whole point of the shape: a new dimension, or the yield
// fields this deliberately leaves out, is a new column on a row that already exists
// rather than a reshape.
//
// What is thrown away is most of the payload: logos, site urls, credit scores, hex
// raw amounts, `asset_dict` (a duplicate of asset_token_list), `proxy_detail` (empty
// on every item), and detail.supply_token_list / borrow_token_list - see the note on
// assetsOf() for why the last two are redundant.

const UNATTRIBUTED = "(unattributed)"

// uint256 max scaled by 1e18: DeBank's "this position has no debt", not a real ratio
const NO_DEBT = 1.157920892373162e59

// Every kpk-curated vault address, flattened across chains (the map's values are the
// issuing protocol, which only the on-chain side's delta attribution needs). The
// on-chain adapter blacklists these so a mandate Safe's vault shares aren't counted
// twice (curated vault TVL is reported separately) and reports them as a separate
// `curated` delta; this view counts them inline and tags them instead, so the gap
// between the two figures stays one filter rather than a different roster.
const CURATED = new Set(Object.values(CURATED_VAULTS).flatMap(Object.keys).map(lower))

// DeBank project ids carry a chain prefix and a version suffix (xdai_aave3,
// compound3, arb_uniswap2) where the on-chain adapter labels by protocol family
// (Aave, Compound, Uniswap). Strip both, then alias the families whose name still
// differs, so breakdown.protocol is diffable between the two reports.
const CHAIN_PREFIX = /^(?:eth|xdai|gno|arb|base|bsc|matic|op|avax)_/
const PROTOCOL_ALIASES = {
  aurafinance: "Aura",
  etherfi: "Ether.fi",
  gnosis: "Maker", // xdai_gnosis is sDAI on Gnosis, which the on-chain side files under Maker
  morphoblue: "Morpho",
  nexus: "Nexus Mutual",
  pancakeswap: "PancakeSwap",
  polygon_staking: "Polygon Staking",
  rocketpool: "Rocket Pool",
  stakewise: "Stakewise",
}

function protocolLabel(projectId, debankName) {
  const family = lower(projectId).replace(CHAIN_PREFIX, "").replace(/\d+$/, "")
  if (PROTOCOL_ALIASES[family]) return PROTOCOL_ALIASES[family]
  // one plain word is safe to capitalise (aave3 -> Aave); anything else keeps
  // DeBank's display name, so a protocol we have no rule for shows up readable
  // instead of as a slug or, worse, silently merged into another bucket
  if (/^[a-z]+$/.test(family)) return family[0].toUpperCase() + family.slice(1)
  return debankName || family || "Unknown"
}

// The receipt-token -> issuer table, chain-keyed and lowercased. Used for idle
// wallet tokens only: a protocol position already knows its protocol, but an idle
// sDAI or USDY holding is a position in Maker / Ondo rather than loose change, which
// is the same call tokenGroups() makes on the on-chain side.
//
// DeBank's own `protocol_id` on a token is NOT a substitute - it is set on plain
// ERC-20s too (WETH -> weth, COW -> cowswap), so trusting it would file idle COW
// under Cowswap. This table is curated to receipt tokens, which is the distinction
// that matters.
const ISSUERS = Object.fromEntries(
  Object.entries(TOKEN_PROTOCOLS).map(([chain, tokens]) => [
    chain,
    Object.fromEntries(Object.entries(tokens).map(([address, protocol]) => [lower(address), protocol])),
  ])
)
const issuerOf = (chain, address) => (ISSUERS[chain] || {})[address]

// DeBank names a native token by its chain slug ("eth", "xdai", "bsc"); the repo
// represents it as the null address on every chain, and `chain` already says which
// one, so normalising here keeps `token` uniformly joinable against on-chain data.
const tokenId = (token) => (/^0x/.test(token.id || "") ? lower(token.id) : nullAddress)
const valueOf = (token) => (Number(token.amount) || 0) * (Number(token.price) || 0)

/**
 * A position's assets, already netted.
 *
 * `asset_token_list` is DeBank's decomposition to UNDERLYING assets - no LP or
 * receipt tokens anywhere, and borrows carry a negative amount - so
 * `sum(amount * price) === stats.net_usd_value` on every item. That makes this one
 * pass the source of net USD, net token amounts and denomination at once, and makes
 * detail.supply_token_list / borrow_token_list redundant.
 *
 * Amounts stay in native units on purpose: yield measured in token terms is immune
 * to price moves, which is what a treasury report wants.
 */
function assetsOf(list) {
  return (list || []).map((token) => ({
    token: tokenId(token),
    symbol: token.symbol,
    chain: getLlamaChain(token.chain),
    decimals: token.decimals,
    amount: Number(token.amount) || 0,
    price: Number(token.price) || 0,
    usd: round(valueOf(token)),
    denom: classifyLeaf(token.symbol),
  }))
}

/**
 * Claimable rewards, tagged with whether `usd` already contains them.
 *
 * DeBank folds some reward lists into asset_token_list (Aave V3's USDS, Merkl's GHO,
 * Stakewise) and leaves others out (Uniswap V3 fees, Nexus / Aave V2 / Polygon
 * staking), so net_usd_value silently omits part of the accrual. `counted: false`
 * means exactly that: this reward is NOT in the position's `usd`, and so not in tvl.
 * It is reported, never re-added - adding it would break the sum-to-tvl invariant
 * and would double-count the half DeBank does include.
 *
 * Unclaimed rewards are the cleanest yield signal in this payload today, which is
 * why they survive the trim.
 */
function rewardsOf(item, assets) {
  const list = item.detail?.reward_token_list || []
  if (!list.length) return null
  const rewards = list.map((token) => {
    const amount = Number(token.amount) || 0
    // "counted" = DeBank listed this reward as its own asset row, same token and same
    // amount. A reward that merely shares a token with the principal (Nexus: 74890
    // NXM staked, 661 NXM earned) is not counted, which matches net_usd_value.
    const counted = assets.some(
      (asset) => asset.token === tokenId(token) && Math.abs(asset.amount - amount) <= Math.abs(amount) * 1e-9
    )
    return { token: tokenId(token), symbol: token.symbol, amount, usd: round(valueOf(token)), counted }
  })
  const total = rewards.reduce((sum, reward) => sum + reward.usd, 0)
  const uncounted = rewards.filter((reward) => !reward.counted).reduce((sum, reward) => sum + reward.usd, 0)
  return { rewards, rewardsUsd: round(total), uncountedRewardsUsd: round(uncounted) }
}

// Unique across every item in a dump, and stable between snapshots - which is what
// diffing two reports for realised yield needs. `pool` + `protocolId` + `chain` are
// also the join keys for yields.llama.fi/pools, so an APY lookup is a map over
// `positions` and nothing else.
const positionKey = (parts) => parts.map((part) => part ?? "").join("|")

/** every position held by one address: protocol positions, then idle wallet tokens */
function positionsOfRecord(record, labels, unpriced) {
  const address = lower(record.address)
  const known = labels.get(address)
  const attribution = known || { clients: record.clients || [], mandates: record.mandates || [] }
  // a Safe shared by two mandates cannot have its USD split, so it reports under the
  // joined label rather than being dropped - the sum-to-tvl invariant comes first
  const client = attribution.clients.join(" + ") || UNATTRIBUTED
  const mandate = attribution.mandates.join(" + ") || null
  const positions = []

  for (const protocol of record.protocols || []) {
    const chain = getLlamaChain(protocol.chain)
    for (const item of protocol.portfolio_item_list || []) {
      const assets = assetsOf(item.asset_token_list)
      const pool = lower(item.pool?.id) || null
      const health = item.detail?.health_rate
      const detailTypes = item.detail_types || []
      const position = {
        key: positionKey([address, chain, protocol.id, pool, item.position_index]),
        client,
        mandate,
        address,
        chain,
        protocol: protocolLabel(protocol.id, protocol.name),
        protocolId: protocol.id,
        type: item.name,
        label: item.detail?.description || item.name,
        pool,
        adapter: item.pool?.adapter_id || null,
        usd: round(Number(item.stats?.net_usd_value) || 0),
        assets,
      }
      // the rest is written only when it says something, so a row stays scannable
      if (item.position_index) position.poolIndex = String(item.position_index)
      if (detailTypes.length && detailTypes.join() !== "common") position.detailTypes = detailTypes
      if (Number(item.stats?.debt_usd_value)) {
        position.assetUsd = round(item.stats.asset_usd_value)
        position.debtUsd = round(item.stats.debt_usd_value)
      }
      if (health !== undefined) position.healthRate = health >= NO_DEBT ? null : health
      Object.assign(position, rewardsOf(item, assets) || {})
      if (CURATED.has(pool) || assets.some((asset) => CURATED.has(asset.token))) position.curated = true
      if (item.update_at) position.updatedAt = item.update_at
      positions.push(position)
    }
  }

  // Idle wallet tokens are positions too (protocol "Wallet", no pool), which is what
  // keeps `positions` a complete partition of tvl. A token DeBank cannot price would
  // enter every rollup as $0 and pollute it, so it goes to `unpriced` instead of
  // being dropped silently - rAURA at 2.3M tokens is not spam even at no price.
  for (const token of record.tokens || []) {
    const chain = getLlamaChain(token.chain)
    const amount = Number(token.amount) || 0
    if (!Number(token.price) || !amount) {
      if (amount)
        unpriced.push({
          client,
          address,
          chain,
          token: tokenId(token),
          symbol: token.symbol,
          amount,
          ...(token.is_suspicious ? { suspicious: true } : {}),
        })
      continue
    }
    const assets = assetsOf([token])
    const issuer = issuerOf(chain, tokenId(token))
    positions.push({
      key: positionKey([address, chain, "wallet", tokenId(token), null]),
      client,
      mandate,
      address,
      chain,
      protocol: issuer || WALLET,
      protocolId: "wallet",
      type: WALLET,
      label: token.symbol,
      pool: null,
      adapter: null,
      usd: assets[0].usd,
      assets,
      ...(CURATED.has(tokenId(token)) ? { curated: true } : {}),
    })
  }

  return positions
}

/**
 * Roll a set of positions up into the same maps kpkTreasuryIR.js emits, so the
 * DeBank and on-chain records are diffable dimension by dimension.
 *
 * chain / client / protocol group whole positions; denom and tokens group the assets
 * inside them, since one position can straddle several (a Uniswap V3 COW/WETH range
 * is part ETH, part COW). Both sum to the same total either way.
 *
 * Values accumulate at full precision and are rounded once, on the way out.
 */
function rollup(positions) {
  const dims = { chain: {}, client: {}, protocol: {}, denom: {} }
  const tokens = {}
  let tvl = 0
  for (const position of positions) {
    tvl += position.usd
    dims.chain[position.chain] = (dims.chain[position.chain] || 0) + position.usd
    dims.client[position.client] = (dims.client[position.client] || 0) + position.usd
    dims.protocol[position.protocol] = (dims.protocol[position.protocol] || 0) + position.usd
    for (const asset of position.assets) {
      dims.denom[asset.denom] = (dims.denom[asset.denom] || 0) + asset.usd
      tokens[asset.symbol] = (tokens[asset.symbol] || 0) + asset.usd
    }
  }
  // Symbol-keyed maps drop anything that rounds to zero: airdrop dust (BOYS, 比特币)
  // and decomposition residue would otherwise fill the denomination view with rows
  // worth nothing. Safe because none of them hides a netted-off exposure - the gross
  // magnitude behind a zero here is zero too - and the dust itself is still in
  // `positions`, so nothing is actually lost.
  //
  // The entity-keyed maps (chain / client / protocol) keep their zeros: there, the
  // presence of a key is itself the information, and a client whose holdings are all
  // dust must not drop out of the report.
  const roundMap = (map, dropZero = false) =>
    sortKeys(
      Object.fromEntries(
        Object.entries(map)
          .map(([key, value]) => [key, round(value)])
          .filter(([, value]) => !dropZero || value !== 0)
      )
    )
  return {
    tvl: round(tvl),
    chain: roundMap(dims.chain),
    client: roundMap(dims.client),
    protocol: roundMap(dims.protocol),
    denom: roundMap(dims.denom, true),
    tokens: roundMap(tokens, true),
  }
}

const sumBy = (positions, pick) => round(positions.reduce((sum, position) => sum + (pick(position) || 0), 0))

/** the whole document: rollups over one flat position array, plus that array */
function buildReport(records, labels) {
  const unpriced = []
  const failed = {}
  const positions = []
  const addresses = new Set()

  for (const record of records) {
    if (record.error) {
      failed[lower(record.address)] = record.error
      continue
    }
    addresses.add(lower(record.address))
    positions.push(...positionsOfRecord(record, labels, unpriced))
  }

  // biggest first: a treasury report is read from the top
  positions.sort((a, b) => b.usd - a.usd || a.key.localeCompare(b.key))

  const totals = rollup(positions)
  const asOf = records.map((record) => record.fetchedAt).filter(Boolean).sort().pop() || new Date().toISOString()

  const clients = {}
  for (const name of Object.keys(totals.client)) {
    const own = positions.filter((position) => position.client === name)
    const rolled = rollup(own)
    clients[name] = {
      tvl: rolled.tvl,
      mandates: [...new Set(own.map((position) => position.mandate).filter(Boolean))],
      safes: [...new Set(own.map((position) => position.address))].sort(),
      positions: own.length,
      chains: rolled.chain,
      protocol: rolled.protocol,
      denom: rolled.denom,
      tokens: rolled.tokens,
      curatedUsd: sumBy(own.filter((position) => position.curated), (position) => position.usd),
      rewardsUsd: sumBy(own, (position) => position.rewardsUsd),
      uncountedRewardsUsd: sumBy(own, (position) => position.uncountedRewardsUsd),
    }
  }

  // `date` / `timestamp` and the duplicated breakdown.chain exist so this record can
  // be fed to kpkTreasuryIR.js's toSeries pivot unchanged. DeBank positions are
  // always "now", so the date is only ever the day the dump was taken.
  const document = {
    source: "debank",
    asOf,
    date: asOf.slice(0, 10),
    timestamp: Math.floor(new Date(asOf.slice(0, 10) + "T00:00:00Z").getTime() / 1000),
    tvl: totals.tvl,
    chains: totals.chain,
    breakdown: { chain: totals.chain, client: totals.client, denom: totals.denom, protocol: totals.protocol },
    tokens: totals.tokens,
    clients,
    totals: {
      // idle tokens are whatever ISSUERS did not reclassify, so the Wallet bucket is
      // the one source of truth for the split rather than a parallel accumulator
      walletUsd: totals.protocol[WALLET] || 0,
      protocolUsd: round(totals.tvl - (totals.protocol[WALLET] || 0)),
      curatedUsd: sumBy(positions.filter((position) => position.curated), (position) => position.usd),
      rewardsUsd: sumBy(positions, (position) => position.rewardsUsd),
      uncountedRewardsUsd: sumBy(positions, (position) => position.uncountedRewardsUsd),
      addresses: addresses.size,
      positions: positions.length,
      unpriced: unpriced.length,
    },
    positions,
  }
  if (unpriced.length) document.unpriced = unpriced
  if (Object.keys(failed).length) document.failed = sortKeys(failed)
  return document
}

// Cheap invariants, run on every report. Same class of check as --verify on the
// on-chain side: an attribution bug shows up here as a dimension that no longer sums
// to tvl, which is otherwise invisible in a 150-row document.
function checkReport(document) {
  const problems = []
  const { tvl } = document
  const tolerance = Math.max(1, Math.abs(tvl) * 1e-6)
  const near = (a, b) => Math.abs(a - b) <= tolerance

  const fromPositions = document.positions.reduce((sum, position) => sum + position.usd, 0)
  if (!near(fromPositions, tvl)) problems.push(`positions sum to ${usd(fromPositions)}, tvl is ${usd(tvl)}`)

  for (const [dim, segments] of Object.entries(document.breakdown)) {
    const sum = Object.values(segments).reduce((total, value) => total + value, 0)
    if (!near(sum, tvl)) problems.push(`breakdown.${dim} sums to ${usd(sum)}, tvl is ${usd(tvl)}`)
  }

  const clientSum = Object.values(document.clients).reduce((total, entry) => total + entry.tvl, 0)
  if (!near(clientSum, tvl)) problems.push(`clients sum to ${usd(clientSum)}, tvl is ${usd(tvl)}`)
  for (const [name, entry] of Object.entries(document.clients))
    if (!near(entry.tvl, document.breakdown.client[name] || 0))
      problems.push(`clients["${name}"].tvl != breakdown.client["${name}"]`)

  const keys = new Set(document.positions.map((position) => position.key))
  if (keys.size !== document.positions.length)
    problems.push(`${document.positions.length - keys.size} duplicate position key(s)`)

  // a joined "A + B" label means one Safe serves two mandates; anything else here is
  // an address off the roster, which makes the client map non-diffable
  const knownClients = new Set(Object.values(CLIENT_LABELS))
  const unknown = Object.keys(document.clients).filter(
    (name) => !name.split(" + ").every((part) => knownClients.has(part))
  )
  if (unknown.length) problems.push(`client label(s) not in CLIENT_LABELS: ${unknown.join(", ")}`)

  return problems
}

// ---- input ----

// Address -> client attribution over EVERY mandate, open window or closed, because a
// saved dump may predate a mandate ending and its money still has to land somewhere.
function labels() {
  const byAddress = new Map()
  for (const mandate of MANDATE_ROSTER)
    for (const safe of mandate.safes) {
      const address = safe.toLowerCase()
      const entry = byAddress.get(address) || { clients: [], mandates: [] }
      if (!entry.mandates.includes(mandate.id)) {
        entry.mandates.push(mandate.id)
        entry.clients.push(mandate.client)
      }
      byAddress.set(address, entry)
    }
  return byAddress
}

// A saved raw dump: either the JSON array --out writes, or the NDJSON stdout stream.
// Reading one is the whole point of --in - the report shape can be iterated on with
// no API calls and no cost.
//
// The dump defines the scope, not the roster: an address whose mandate has since
// closed is still in the file and still holds money, so it is reported rather than
// filtered out by today's window. --client / --address narrow it when asked, and it
// is an error if they narrow it to nothing.
function readDump(file) {
  const text = fs.readFileSync(file, "utf8").trim()
  if (!text) throw new Error(`${file} is empty`)
  let records
  try {
    records = text.startsWith("[")
      ? JSON.parse(text)
      : text.split("\n").filter((line) => line.trim()).map((line) => JSON.parse(line))
  } catch (e) {
    throw new Error(`${file} is neither a JSON array nor NDJSON of raw records: ${e.message}`)
  }
  if (!Array.isArray(records)) throw new Error(`${file} does not hold an array of records`)

  const wantedClients = new Set(asList(flags.client).map((id) => id.toLowerCase()))
  const wantedAddresses = new Set(asList(flags.address).map((address) => address.toLowerCase()))
  const kept = records.filter((record) => {
    if (wantedAddresses.size && !wantedAddresses.has((record.address || "").toLowerCase())) return false
    if (wantedClients.size && !(record.mandates || []).some((id) => wantedClients.has(id))) return false
    return true
  })
  if (!kept.length) throw new Error(`No records in ${file} matched --client/--address`)

  const known = labels()
  const offRoster = kept.map((record) => (record.address || "").toLowerCase()).filter((address) => !known.has(address))
  console.error(`read ${kept.length} of ${records.length} record(s) from ${file}`)
  if (offRoster.length) console.error(`  not on the mandate roster: ${offRoster.join(", ")}`)
  return kept
}

// ---- run ----

const emitRaw = (record) => console.log(JSON.stringify(record, null, flags.pretty ? 2 : undefined))

async function fetchAll(entries, stream) {
  if (!process.env.DEBANK_API_KEY) throw new Error("DEBANK_API_KEY is not set (put it in .env)")

  const concurrency = Number(flags.concurrency) || 3
  const scope = flags.chain === undefined ? "all chains" : `chain ${flags.chain}`
  console.error(`querying DeBank for ${entries.length} address(es), ${scope}, concurrency ${concurrency}\n`)

  const records = []
  const failed = []
  let total = 0

  await pool(entries, concurrency, async (entry) => {
    const label = `${entry.address} (${entry.clients.join(" + ") || "off roster"})`
    let record
    try {
      record = await positionsOf(entry)
      const value = debankUsd(record)
      total += value
      console.error(`  ${label}: ${record.protocols.length} protocol(s), ${usd(value)}`)
    } catch (e) {
      record = { ...entry, fetchedAt: new Date().toISOString(), error: e.message }
      failed.push(entry.address)
      console.error(`  ${label}: ${e.message}`)
    }
    records.push(record)
    // raw mode streams as records complete; a report needs all of them first
    if (stream) emitRaw(record)
  })

  console.error(`\n${records.length - failed.length}/${entries.length} address(es) fetched, ${usd(total)} per DeBank`)
  if (failed.length) console.error(`failed: ${failed.join(", ")}`)
  if (failed.length) process.exitCode = 1
  return records
}

function printReport(document) {
  const top = (map, count = 6) =>
    Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, count).map(([name, value]) => `${name} ${usd(value)}`).join(", ")

  console.error(`\n${document.totals.positions} position(s) across ${document.totals.addresses} address(es), ${usd(document.tvl)} per DeBank`)
  for (const dim of ["client", "protocol", "denom", "chain"]) console.error(`  by ${dim}: ${top(document.breakdown[dim])}`)
  console.error(`  wallet ${usd(document.totals.walletUsd)}, protocols ${usd(document.totals.protocolUsd)}`)
  console.error(`  kpk-curated vaults (tagged, counted): ${usd(document.totals.curatedUsd)}`)
  console.error(`  claimable rewards ${usd(document.totals.rewardsUsd)}, of which ${usd(document.totals.uncountedRewardsUsd)} is NOT in tvl`)
  if (document.totals.unpriced) console.error(`  ${document.totals.unpriced} unpriced holding(s), see .unpriced`)
  if (document.failed) console.error(`  ${Object.keys(document.failed).length} address(es) failed, excluded`)

  const problems = checkReport(document)
  for (const problem of problems) console.error(`  INVARIANT: ${problem}`)
  if (problems.length) process.exitCode = 1
}

// The DeBank view needs records before it can shape anything: a saved dump if --in
// was given, otherwise a live fetch of whatever the roster resolves to. `stream` is
// false when the caller owns stdout - the report shapes need every record in hand
// before they can emit a single line.
async function debankRecords({ stream }) {
  if (typeof flags.in === "string") return readDump(flags.in)

  const entries = roster()
  if (!entries.length) throw new Error("No addresses matched. Try --all, or --list to see the roster.")
  return fetchAll(entries, stream)
}

function listRoster() {
  const entries = roster()
  if (!entries.length) throw new Error("No addresses matched. Try --all.")
  for (const entry of entries) console.log(`${entry.address}  ${entry.clients.join(" + ") || "(off roster)"}`)
  console.error(`\n${entries.length} address(es) across ${new Set(entries.flatMap((e) => e.mandates)).size} mandate(s)`)
}

async function debankMode() {
  const shape = typeof flags.shape === "string" ? flags.shape : "raw"
  if (!["raw", "report"].includes(shape)) throw new Error(`Invalid --shape for --debank: ${shape} (expected raw or report)`)
  // a client breakdown that omits idle tokens is wrong, and they are ~8% of tvl
  if (shape === "report") flags.wallet = true
  if (flags.list) return listRoster()

  const streamed = shape === "raw" && typeof flags.in !== "string"
  const records = await debankRecords({ stream: streamed })

  let output = records
  if (shape === "report") {
    output = buildReport(records, labels())
    console.log(JSON.stringify(output, null, flags.pretty ? 2 : undefined))
    printReport(output)
  } else if (!streamed) {
    // a dump replayed unchanged: fetchAll already streamed the records it fetched
    records.forEach(emitRaw)
  }

  if (typeof flags.out === "string") {
    fs.writeFileSync(flags.out, JSON.stringify(output, null, 2))
    console.error(`wrote ${flags.out}`)
  }
}

// ============================================================================
// Report mode: the chart and today's positions in one document
// ============================================================================
//
//   { generatedAt, window, chart: [...], positions: {...} }
//
// `chart` is the daily history out of the cache store - RPC-sourced, one record per
// date, the same shape replay writes. `positions` is the DeBank report for right now:
// what the mandates are actually holding, which no historical source can give.
//
// The two do NOT measure the same thing out of the box, so the newest chart point
// needs care. Reconciling them is one filter and one caveat:
//
//   - DeBank COUNTS kpk-curated vault shares; the on-chain adapter excludes them and
//     reports them as the record's `curated` delta. So a DeBank-derived point drops
//     every position tagged `curated` before rolling anything up - ~$20M today.
//   - What is left still runs ABOVE the on-chain figure by a small, stubbornly even
//     margin: +1.4% to +2.0% per client on 2026-08-31, of which claimable rewards
//     explain $248. The rest is pricing - DeBank's feed against DefiLlama's. No
//     filter closes it.
//
// That residual is why a DeBank point carries `source: "debank"` and `provisional:
// true`, and why `window.seam` states the gap measured on the day it was built.
//
// The latest day is DeBank's, even when the cache already holds an RPC record for it:
// an RPC record is a 00:00:00 UTC snapshot and can be most of a day stale, where
// DeBank is now. What that costs is the seam - the point reads high by it, so the hop
// from an RPC record into a DeBank one is a source artefact rather than a move.
//
// It does NOT revise afterwards. A cache run stores its DeBank reading as that date's
// final record, so re-rendering tomorrow shows the same number rather than one that
// has quietly dropped ~1.5%. A consumer that needs a homogeneous series filters on
// `source` at both ends of every hop; `--rpc-only` never builds a mixed one at all.
//
// `tokens` on a DeBank point is the one rollup NOT diffable against its RPC
// neighbours: DeBank decomposes positions to underlying assets (USDC, WXDAI) where an
// on-chain record holds the receipt tokens actually in the Safe (aEthUSDC, sDAI).

// The DeBank report rolled up as though it were an on-chain record: curated positions
// split off, `chain` lifted to `chains`, and the curated block rebuilt on the side so
// the point carries the same `curated` delta an RPC record does. rollup() is the
// report's own, so these maps are computed exactly like the ones in `positions`.
function chartPointFromReport(document) {
  const shaped = (rows) => {
    const { tvl, chain, client, protocol, denom, tokens } = rollup(rows)
    return { tvl, chains: chain, breakdown: { client, denom, protocol }, tokens }
  }
  return {
    date: document.date,
    timestamp: document.timestamp,
    ...shaped(document.positions.filter((position) => !position.curated)),
    curated: shaped(document.positions.filter((position) => position.curated)),
    source: "debank",
    provisional: true,
  }
}

// --report renders the snapshot --cache took; it does not call DeBank itself. That
// is the whole point of folding the two jobs together: the document can be rebuilt
// as often as you like off one scheduled fetch, and every rebuild says the same
// thing rather than drifting with whenever it happened to run.
//
// --live and --in still resolve on the spot, for an ad-hoc look between cache runs.
// Neither is written back - only --cache owns POSITIONS_KEY, so an ad-hoc report can
// never quietly become the stored snapshot everything else reads.
async function reportPositions() {
  if (flags.live && typeof flags.in === "string") throw new Error("--live and --in are two different sources; pick one")

  if (flags.live || typeof flags.in === "string") {
    const document = buildReport(await debankRecords({ stream: false }), labels())
    const source = flags.live ? "live DeBank fetch (--live)" : `reshaped from ${flags.in}`
    console.error(`positions: ${source}, ${document.date} - not written back to ${POSITIONS_KEY}`)
    return document
  }

  const stored = await loadPositions()
  if (!stored)
    throw new Error(`no positions stored in ${POSITIONS_KEY} - run --cache to take a snapshot, or --live to fetch one now`)

  const hours = positionsAge(stored)
  console.error(`positions: ${stored.date} from ${POSITIONS_KEY}${hours === null ? "" : `, ${hours.toFixed(1)}h old`}`)
  return stored
}

async function reportMode() {
  if (flags.shape) throw new Error("--shape does not apply to --report (the document shape is fixed)")
  flags.wallet = true // a client breakdown that omits idle tokens is wrong

  const to = asDate(flags.to || today(), "--to")
  const from = asDate(flags.from || addDays(to, -(WINDOW_DAYS - 1)), "--from")
  if (from > to) throw new Error(`--from (${from}) is after --to (${to})`)

  const store = await loadStore()
  const window = datesBetween(from, to)
  // `source: "rpc"` FIRST so a stored record's own source wins. The daily store now
  // holds DeBank's own record for the latest day, and stamping that "rpc" would hide
  // the one field every consumer is told to filter on.
  const chart = window.filter((date) => store.dates[date]).map((date) => ({ source: "rpc", ...store.dates[date] }))
  const gaps = window.length - chart.length
  console.error(`chart ${from} .. ${to}: ${chart.length}/${window.length} date(s) from ${STORE_KEY}${gaps ? `, ${gaps} gap(s)` : ""}`)
  if (!chart.length) console.error("  no stored dates in the window - run --cache first, or the chart is DeBank's point alone")
  // a date replayed with --dims=chain has no client/protocol split, and a chart built
  // on those points would plot flat rather than empty. Say so rather than shipping it.
  const flat = chart.filter((record) => !record.breakdown).map((record) => record.date)
  if (flat.length)
    console.error(`  ${flat.length} date(s) carry no breakdown (replayed with narrowed --dims): ${flat.slice(0, 6).join(", ")}${flat.length > 6 ? ` ... +${flat.length - 6}` : ""}`)

  const positions = await reportPositions()
  printReport(positions)

  const point = chartPointFromReport(positions)

  // The seam: DeBank ex-curated against an RPC point. ONLY a same-date RPC record
  // isolates the source difference - anything earlier folds in whatever the treasury
  // actually did in between, and the two cannot be told apart from here. That is not
  // a hypothetical: on 2026-08-31 the same-date gap was +1.42% while the one-day-back
  // gap read -0.07%, because a real -1.5% day happened to cancel it. So prefer the
  // same-date record when the cache has one, and label the fallback for what it is.
  // Only an RPC record measures the seam. The store's latest-day record may itself be
  // DeBank's now, and comparing DeBank against DeBank would report a 0% gap that means
  // nothing at all.
  const rpcRecords = chart.filter((record) => record.source === "rpc")
  const sameDate = rpcRecords.find((record) => record.date === point.date)
  const against = sameDate || [...rpcRecords].reverse().find((record) => record.date !== point.date)
  const gapDays = against ? Math.round((Date.parse(`${point.date}T00:00:00Z`) - Date.parse(`${against.date}T00:00:00Z`)) / 86400000) : null
  const seam = against
    ? {
        comparedTo: against.date,
        gapDays,
        rpcTvl: against.tvl,
        debankTvl: point.tvl,
        deltaPct: round(((point.tvl - against.tvl) / against.tvl) * 100),
        note: gapDays
          ? `${gapDays} day(s) apart: real movement PLUS the source difference, inseparable without a same-date RPC record`
          : "same date: the source difference alone (pricing + coverage), not a treasury move",
      }
    : null
  if (seam)
    console.error(
      `  seam vs RPC ${seam.comparedTo}${gapDays ? ` (${gapDays}d back)` : " (same date)"}: ${usd(seam.rpcTvl)} -> ${usd(seam.debankTvl)}, ${seam.deltaPct > 0 ? "+" : ""}${seam.deltaPct}%` +
        (gapDays ? " - mixes a real move with the source difference" : " - source difference alone")
    )

  // DeBank owns the latest day: it is the freshest reading available, where an RPC
  // record is a 00:00:00 UTC snapshot that can be most of a day old. So its point
  // REPLACES a same-date record rather than deferring to it, and reads high by the
  // seam above for its trouble. --rpc-only opts out.
  //
  // `provisional` here means only "resolved at render time, not read from the store".
  // It is NOT a promise that the number revises later: a cache run stores its DeBank
  // reading as that date's final record, so in the ordinary case this point and the
  // stored one agree, and re-rendering tomorrow shows the same figure.
  const inWindow = point.date >= from && point.date <= to

  // The DeBank point owns the latest day only if it IS the latest day, and that is no
  // longer automatic. It used to be a live fetch, so its date was always today and
  // always at or past the newest stored record; it is now whatever the last cache run
  // snapshotted, which a --no-debank run or a failed DeBank half can leave behind the
  // store.
  //
  // Splicing a lagging point in would be wrong twice over: it would overwrite a
  // perfectly good same-date RPC record with a staler reading, AND leave newer RPC
  // points after it - so the seam's ~+1.8% bias would show up as a fake down-tick
  // into the following day rather than as the up-tick at the end of the series that
  // consumers are told to expect. An RPC point in the middle of an RPC series is the
  // one thing this chart must not mix.
  const newestStored = chart.reduce((latest, record) => (record.date > latest ? record.date : latest), "")
  const lags = Boolean(newestStored) && point.date < newestStored

  let provisional = null
  if (flags["rpc-only"]) console.error(`--rpc-only: chart left RPC-sourced, DeBank's ${point.date} point not used`)
  else if (!inWindow)
    console.error(`  DeBank reads ${point.date}, outside ${from}..${to} - point not used (its report is still in .positions)`)
  else if (lags)
    console.error(
      `  DeBank reads ${point.date}, behind the newest stored record ${newestStored} - point not used, the chart keeps what the store has.\n` +
        `    The stored snapshot is stale: run --cache to refresh it, or --live for a fresh fetch. Its report is still in .positions.`
    )
  else {
    const existing = chart.findIndex((record) => record.date === point.date)
    if (existing >= 0) {
      // Not necessarily an RPC record any more: a cache run may already have put its
      // own provisional point in this slot, and sameDate would be undefined for it.
      const replaced = chart[existing]
      chart[existing] = point
      console.error(
        `  ${point.date} taken from DeBank: ${usd(point.tvl)} ex-curated, replacing the ${replaced.source} record's ${usd(replaced.tvl)} (provisional)`
      )
    } else {
      chart.push(point)
      console.error(`  ${point.date} appended from DeBank: ${usd(point.tvl)} ex-curated, provisional`)
    }
    provisional = point.date
  }
  chart.sort((a, b) => (a.date < b.date ? -1 : 1))

  const document = {
    generatedAt: new Date().toISOString(),
    window: {
      from,
      to,
      dates: chart.length,
      gaps: window.length - chart.length,
      sources: [...new Set(chart.map((record) => record.source))],
      provisional,
      seam,
    },
    chart,
    positions,
  }

  console.log(JSON.stringify(document, null, flags.pretty ? 2 : undefined))
  if (typeof flags.out === "string") {
    fs.writeFileSync(flags.out, JSON.stringify(document, null, 2))
    console.error(`wrote ${flags.out}`)
  }
}

// ---- entry ----

// One mode per run. Replay is the default because it is the only one that takes bare
// positional dates; the rest are named.
const MODES = { cache: fillCache, debank: debankMode, report: reportMode }

// Validated inside the run guard, not at module scope: importing this file for the
// adapter must never throw over whatever happens to be on the importer's argv.
function selectMode() {
  const asked = Object.keys(MODES).filter((mode) => flags[mode])
  if (asked.length > 1) throw new Error(`--${asked.join(" and --")} are separate modes; pick one`)
  if (asked.length && positional.length) throw new Error(`--${asked[0]} takes --from/--to, not positional dates`)
  return asked.length ? MODES[asked[0]] : replay
}

module.exports = exportObjects

// guarded so the adapter half stays importable without kicking off a run
if (require.main === module) {
  const run = async () => (flags.help || flags.h ? usage() : selectMode()())

  run()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(e.message || e)
      process.exit(1)
    })
}
