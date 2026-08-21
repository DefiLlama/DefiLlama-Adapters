const { getCache } = require('../helper/http')

// NOTE FOR REVIEWERS — this is an API-sourced adapter, which this repo normally
// rejects. It is here by explicit exception: on 2026-08-18 Rick from DefiLlama
// wrote, of LP Agent specifically:
//
//   "It's better not to track TVL on via API, but since this is the only
//    alternative, you may make a PR and one of our devs will take a look and
//    comment on the PR."
//
// The reason there is no alternative: LP Agent is non-custodial and owns no
// contract. Every position it manages is an ordinary Meteora or Uniswap
// position owned by the *end user's own wallet*, so there is no protocol vault,
// factory or router to enumerate. Membership of the managed set is off-chain
// bookkeeping. Enumerating it on-chain would mean publishing the full list of
// user wallets, which LP Agent will not do.
const ENDPOINT = 'https://api.lpagent.io/api/v1/defillama/tvl'

// The endpoint is refreshed hourly by a background job and marks a reading
// `fresh: false` once it is three intervals old. This is a backstop for the
// case where that flag itself stops being maintained: past six hours, refuse
// to republish rather than presenting a frozen number as a live one.
const MAX_AGE_MS = 6 * 60 * 60 * 1000

// Tolerance for the venue-vs-chain cross-check below. Both sides are float sums
// of the same rows in a different order, so they agree to rounding, not to the
// bit.
const RECONCILE_TOLERANCE = 1e-6

// Both chain exports want the same snapshot; fetch it once per run.
const fetchSnapshot = async () => {
  const res = await getCache(ENDPOINT)
  const snapshot = res && res.data
  if (!snapshot || !Array.isArray(snapshot.chains) || !Array.isArray(snapshot.venues))
    throw new Error('LP Agent TVL endpoint returned an unexpected payload')

  const age = Date.now() - new Date(snapshot.computedAt).getTime()
  if (!(age >= 0) || age > MAX_AGE_MS)
    throw new Error(`LP Agent TVL snapshot is stale (computedAt ${snapshot.computedAt})`)

  return snapshot
}

// One exported tvl function per chain. Every row the endpoint publishes carries
// the DefiLlama chain slug it belongs to, so each export takes its own slice.
//
// Each failure below throws rather than returning a smaller number: DefiLlama
// keeps the last good value when an adapter errors, and a silent undercount
// would look exactly like users withdrawing.
const chainTvl = (llamaChain) => async (api) => {
  const snapshot = await fetchSnapshot()

  const chain = snapshot.chains.find((c) => c.llamaChain === llamaChain)
  if (!chain) throw new Error(`LP Agent published no reading for ${llamaChain}`)
  if (!chain.fresh) throw new Error(`LP Agent reading for ${llamaChain} is past its refresh window`)
  // Some managed wallets could not be read, so this sum is short by an unknown
  // amount.
  if (!chain.complete) throw new Error(`LP Agent reading for ${llamaChain} is incomplete`)

  // Deployed value is published per venue so the breakdown reconciles to the
  // chain total. Summing the venues here rather than trusting the chain's own
  // field is what keeps the two honest.
  const venues = snapshot.venues.filter((v) => v.llamaChain === llamaChain)
  const deployed = venues.reduce((acc, v) => acc + (v.tvlUsd ?? 0), 0)
  if (Math.abs(deployed - (chain.deployedUsd ?? 0)) > RECONCILE_TOLERANCE * Math.max(1, deployed))
    throw new Error(`LP Agent venue breakdown does not reconcile on ${llamaChain}`)

  venues.forEach(({ tvlUsd }) => api.addUSDValue(tvlUsd ?? 0))

  // Capital sitting in the managed agent wallets that has not been deployed
  // into a position yet. Published separately by the endpoint and added
  // separately here, so dropping it is a one-line change if reviewers decide
  // undeployed balances should not count.
  api.addUSDValue(chain.idleUsd ?? 0)
}

module.exports = {
  timetravel: false,
  // TVL is reported as a USD total, not as a token breakdown.
  misrepresentedTokens: true,
  // The deployed half of this TVL is liquidity in Meteora DLMM, Meteora DAMM v2
  // and Uniswap v3/v4 pools, all listed separately on DefiLlama, so it is
  // counted there too.
  doublecounted: true,
  methodology:
    "LP Agent is a non-custodial automation layer for liquidity provision: users keep custody of their own wallets and LP Agent opens, rebalances and closes their concentrated-liquidity positions - Meteora DLMM and DAMM v2 on Solana, Uniswap v3 and v4 on Robinhood Chain. TVL is the current USD value of the capital under LP Agent management, served from the LP Agent backend at /api/v1/defillama/tvl and refreshed hourly. It has two components, published and added separately: the value of the open managed positions, summed per venue and valued on-chain position by position, and the balances held in those same managed agent wallets that have not yet been deployed into a position. Positions are ordinary Meteora and Uniswap positions owned by each user's wallet rather than by an LP Agent contract, so there is no protocol-owned vault or factory to enumerate on-chain and membership of the managed set is off-chain bookkeeping; the endpoint therefore publishes only aggregate USD and position counts per chain and venue, never per-user data. Marked doublecounted because the deployed liquidity is already counted under Meteora and Uniswap.",
  solana: { tvl: chainTvl('solana') },
  robinhood: { tvl: chainTvl('robinhood') },
}
