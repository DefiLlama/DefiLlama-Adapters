/**
 * TartSwap — BNB Smart Chain (chainId 56)
 *
 * Destination path in the DefiLlama repo: projects/tartswap/index.js
 * (the `../helper/...` requires below assume that location).
 *
 * ---------------------------------------------------------------------------
 * WHAT THIS PROTOCOL ACTUALLY IS (read this before changing the buckets)
 * ---------------------------------------------------------------------------
 * TartSwap ships four user-facing products on BSC. Only three of them hold
 * value in TartSwap-owned contracts:
 *
 *   1. "Swap"  — TartSwapRouterV2 (0xBd9Ab5...840F) is a FEE-TAKING WRAPPER over
 *      PancakeSwap V2, NOT an AMM. Verified on-chain: the router exposes
 *      `pancakeRouter() == 0x10ED43C718714eb63d5aA57B78B54704E256024E` and has no
 *      `factory()`. It charges 35 bps on the input and forwards the swap to
 *      PancakeSwap. It holds no liquidity and creates no pairs.
 *
 *      => There is therefore NO TartSwap AMM factory and NO TartSwap pairs to
 *         sum. Every "TartSwap pool" a user sees in the UI is a PancakeSwap V2
 *         pair, already counted in PancakeSwap's TVL. Counting those here would
 *         be straight double counting, so this adapter deliberately does not.
 *         (A native `TartSwapV2Factory` exists in the team's repo but is NOT
 *         deployed to mainnet — see README, "if the native AMM ships".)
 *
 *   2. "OTC desk" — TartSwapOTC, a trustless P2P escrow. A maker locks the asset
 *      they are selling until a taker fills or the maker cancels. The owner can
 *      never touch escrowed funds. This is genuine, non-double-counted TVL.
 *
 *   3. "StakinGames" — FastRoundArena V2, a parimutuel round engine that escrows
 *      real USDT staked by players, plus SeederRewards, which escrows the
 *      founder-bonus credits already owed to specific players.
 *
 *   4. "Staking / Farms" — the protocol's own tokens (TART, launched 2026-08-31,
 *      and CREPE) locked in their staking vaults, and PancakeSwap LP tokens
 *      deposited into TartSwap's farm (incl. the TART/WBNB pair, pid 6).
 *
 * ---------------------------------------------------------------------------
 * BUCKETS
 * ---------------------------------------------------------------------------
 *   tvl     — third-party assets escrowed in TartSwap contracts (OTC legs, game
 *             collateral, seeder liability). Counted once, no overlap with any
 *             other protocol.
 *   staking — TartSwap's own tokens (TART and CREPE) locked by users in their
 *             staking vaults and the CREPE single-token pools. DefiLlama's
 *             `staking` bucket is exactly "the protocol's own token staked in
 *             the protocol", so this belongs here and NOT in `tvl`.
 *   pool2   — LP tokens users deposited into TartSwap's farm. The underlying
 *             pairs are PancakeSwap's, so these must stay out of `tvl`; `pool2`
 *             is reported separately by DefiLlama and does not inflate the
 *             headline TVL number.
 *
 * DELIBERATELY EXCLUDED (protocol revenue / treasury, never user TVL):
 *   GameFeeSplitter   0xcf86404855c21964d6663960BF5AeeB76CD83818 — game fee wallet;
 *                     owner can `sweepCollateral` the whole balance.
 *   TartFeeDistributor 0xdf0aC48105BbC66EBe2976b03097A87Bb80744c1 — swap-fee split.
 *   TartFeeConverterV2 0xDeA32774f6d8d2170192275C23Aec2f3bc1492Bd — fee -> CREPE buys.
 *   TartFeeCollector   0xfa261c02b023b8a01F4Fc25Cca658757ddA48521
 *   Treasury / Reserve / INCOME EOAs.
 *   Vault reward reserve — undistributed rewards are protocol-owned until
 *   streamed, so `totalStaked()` is used instead of `balanceOf(vault)`.
 */

const { sumTokens2 } = require('../helper/unwrapLPs')

// -- tokens -------------------------------------------------------------------
// TartSwap's own ecosystem tokens, both 9 decimals (verified on-chain):
//   CREPE — the original reward token.
//   TART  — the protocol token, listed on PancakeSwap 2026-08-31.
// These are the only tokens this adapter has to name explicitly: every other
// asset (OTC legs, game collateral, farm LPs) is discovered from chain state at
// call time. The game collateral is BSC-USD/USDT
// 0x55d398326f99059fF775485246999027B3197955, read from the arena rather than
// hardcoded.
const CREPE = '0xeb2B7d5691878627eff20492cA7c9a71228d931D'
const TART = '0x7AB8d02CBb51Ff7223fDe700eAaa2a91Bf750314'
const OWN_TOKENS = new Set([CREPE.toLowerCase(), TART.toLowerCase()])

// -- TartSwap contracts (all verified on BscScan, all chainId 56) --------------
const OTC_DESK = '0x22E6B727286c02C5251682b1A1a65FdE71296Add' // P2P escrow desk
const FAST_ROUND_ARENA = '0xbB512254A54067bB16eF10553F86C944B8a2B733' // parimutuel escrow
const SEEDER_REWARDS = '0x1898b5aA0cB9184750C19Da0A79c61c211D20363' // seeder-bonus liability
const STAKING_VAULT = '0x20940d3573F1629F6c5226C2DDa2e9a28b364B33' // CREPE lock vault
const TART_STAKING_VAULT = '0x038C92ac8269c9A648BA06e434056706Bc7832cE' // TART tiered vault
const STAKING_V3 = '0x44eFB1281cD682fC889F99b63A2dFD75fF89b689' // CREPE single-token pools
const LP_FARM = '0x4f6Eb30a521E5F5FDE2BD433cDc805962902F316' // LP farm (TART/WBNB = pid 6)

const abi = {
  // TartSwapOTC
  offerCount: 'uint256:offerCount',
  offers:
    'function offers(uint256) view returns (address maker, address taker, address sellToken, address buyToken, uint256 sellRemaining, uint256 buyRemaining, uint64 expiry, bool allowPartial, uint8 status)',
  // FastRoundArena V2
  collateralToken: 'address:collateralToken',
  // SeederRewards
  totalOwed: 'uint256:totalOwed',
  // TartStakingVault
  totalStaked: 'uint256:totalStaked',
  stakingToken: 'address:stakingToken',
  // TartLPFarm / TartStakingV3 (identical pool ABI)
  poolLength: 'uint256:poolLength',
  pools:
    'function pools(uint256) view returns (address stakeToken, address rewardToken, uint256 rewardPerSecond, uint64 startTime, uint64 endTime, uint64 lockDuration, uint64 lastRewardTime, uint256 accRewardPerShare, uint256 totalStaked, bool active)',
}

const OFFER_STATUS_OPEN = 1

/**
 * OTC desk escrow.
 *
 * The set of escrowed assets is discovered from chain state (the open offer
 * book), never from a hardcoded token list — makers may list any BEP-20. We then
 * read the desk's real balances for those tokens, which equals the escrow: the
 * fill fee is forwarded to the treasury inside the same transaction, so the
 * contract never retains protocol revenue.
 */
async function addOtcEscrow(api) {
  const offerCount = await api.call({ abi: abi.offerCount, target: OTC_DESK })
  if (!Number(offerCount)) return

  // Offer ids are 1-based: the contract assigns `id = ++offerCount`, so valid ids
  // run 1..offerCount and id 0 is never used.
  const offers = await api.multiCall({
    abi: abi.offers,
    target: OTC_DESK,
    calls: Array.from({ length: Number(offerCount) }, (_, i) => i + 1),
  })

  // Only Open offers still hold collateral. Filled/Cancelled offers have already
  // paid out, and an expired-but-unreclaimed offer is still Open and still funded.
  const escrowedTokens = new Set()
  for (const offer of offers) {
    if (Number(offer.status) !== OFFER_STATUS_OPEN) continue
    if (!Number(offer.sellRemaining)) continue
    // sellToken == address(0) means the maker escrowed native BNB.
    escrowedTokens.add(offer.sellToken)
  }
  if (!escrowedTokens.size) return

  return sumTokens2({ api, owner: OTC_DESK, tokens: [...escrowedTokens] })
}

/**
 * StakinGames escrow.
 *
 * The arena holds every player's stake for open/locked rounds plus the winnings
 * of resolved rounds that have not been claimed yet; its collateral balance is
 * exactly that liability (the contract rejects fee-on-transfer tokens and moves
 * the fee leg out at settlement). The collateral address is read from the arena
 * rather than assumed, so a future redeploy on a different stable still works.
 *
 * SeederRewards is counted at `totalOwed`, NOT at its balance. `totalOwed` is the
 * sum of bonus credits already booked to specific player addresses, and the
 * contract forbids the owner from sweeping it (`skimExcess` can only take
 * balance - totalOwed). Any surplus above `totalOwed` is protocol money and is
 * therefore excluded. Judgement call: these credits are irrevocably owed to
 * users and users can always exit them (`claimAsCollateral`), so they are user
 * TVL, not revenue.
 *
 * No double counting: the arena transfers the bonus to SeederRewards in the same
 * transaction as settlement, so a given unit of USDT sits in exactly one of them.
 */
async function addGamesEscrow(api) {
  const collateral = await api.call({ abi: abi.collateralToken, target: FAST_ROUND_ARENA })
  await sumTokens2({ api, owner: FAST_ROUND_ARENA, tokens: [collateral] })

  const owed = await api.call({ abi: abi.totalOwed, target: SEEDER_REWARDS })
  api.add(collateral, owed)
}

/** Enumerate a farm/staking contract's pools (shared ABI). */
function getPools(api, target) {
  return api.fetchList({ lengthAbi: abi.poolLength, itemAbi: abi.pools, target })
}

// -----------------------------------------------------------------------------
// tvl — third-party assets escrowed in TartSwap contracts, counted exactly once.
// -----------------------------------------------------------------------------
async function tvl(api) {
  await addOtcEscrow(api)
  await addGamesEscrow(api)
  return api.getBalances()
}

// -----------------------------------------------------------------------------
// staking — TartSwap's own tokens (CREPE and TART) locked by users.
// -----------------------------------------------------------------------------
async function staking(api) {
  // Vaults: `totalStaked()` is user principal only. `balanceOf(vault)` would
  // also include the undistributed reward reserve, which is protocol-owned.
  for (const vault of [STAKING_VAULT, TART_STAKING_VAULT]) {
    const [stakingToken, vaultStaked] = await Promise.all([
      api.call({ abi: abi.stakingToken, target: vault }),
      api.call({ abi: abi.totalStaked, target: vault }),
    ])
    api.add(stakingToken, vaultStaked)
  }

  // StakingV3 custom pools: only own-token pools belong in `staking`. Any pool
  // whose stake token is not CREPE/TART is an LP pool and is picked up by pool2().
  const pools = await getPools(api, STAKING_V3)
  for (const pool of pools) {
    if (!OWN_TOKENS.has(pool.stakeToken.toLowerCase())) continue
    api.add(pool.stakeToken, pool.totalStaked)
  }

  return api.getBalances()
}

// -----------------------------------------------------------------------------
// pool2 — LP tokens users deposited into TartSwap's farm.
//
// These are PancakeSwap V2 LPs, so the underlying reserves are already inside
// PancakeSwap's TVL. Reporting them under `pool2` (which DefiLlama keeps out of
// the headline TVL) credits TartSwap for the locked LP without double counting.
// -----------------------------------------------------------------------------
async function pool2(api) {
  const [farmPools, stakingPools] = await Promise.all([
    getPools(api, LP_FARM),
    getPools(api, STAKING_V3),
  ])

  // Skip own-token pools (they are `staking`) and empty pools. Dropping empty
  // pools is safe because `totalStaked` is read at the same block as the
  // balances, and it keeps LP resolution from touching retired pools whose
  // stake token is a non-standard pair contract.
  const isFundedLp = (pool) =>
    !OWN_TOKENS.has(pool.stakeToken.toLowerCase()) && Number(pool.totalStaked) > 0
  const farmLps = farmPools.filter(isFundedLp).map((pool) => pool.stakeToken)
  const stakingLps = stakingPools.filter(isFundedLp).map((pool) => pool.stakeToken)

  return sumTokens2({
    api,
    ownerTokens: [
      [farmLps, LP_FARM],
      [stakingLps, STAKING_V3],
    ],
    resolveLP: true,
  })
}

module.exports = {
  methodology:
    'Counts assets held in TartSwap-owned contracts on BNB Smart Chain. ' +
    'TVL: (a) tokens escrowed by makers in the TartSwapOTC peer-to-peer desk for offers that are still open, ' +
    '(b) USDT collateral escrowed by players in the FastRoundArena parimutuel game engine (open, locked and unclaimed-resolved rounds), and ' +
    '(c) the SeederRewards outstanding liability (totalOwed), i.e. game bonus credits already booked to specific players that the protocol can never reclaim. ' +
    'Staking: TartSwap\'s own tokens locked by users - TART (the protocol token, listed 2026-08-31) in its tiered staking vault and CREPE in the TartStakingVault and the CREPE single-token staking pools; each vault\'s undistributed reward reserve is excluded because it is protocol-owned until streamed. ' +
    'Pool2: LP tokens users deposited into the TartSwap farm (incl. the TART/WBNB PancakeSwap pair). ' +
    'The TartSwap swap router is a fee-taking wrapper around PancakeSwap V2 rather than an AMM of its own, so it holds no liquidity and no pair reserves are counted here - that liquidity already belongs to PancakeSwap. ' +
    'Fee and treasury contracts (GameFeeSplitter, TartFeeDistributor, TartFeeConverter, TartFeeCollector, treasury and reserve wallets) are protocol revenue and are excluded.',
  // Earliest TartSwap contract in this adapter: TartStakingVault, deployed
  // 2026-06-29T15:33:46Z on BSC mainnet.
  start: 1782747226,
  hallmarks: [['2026-08-31', 'TART token listed on PancakeSwap']],
  bsc: {
    tvl,
    staking,
    pool2,
  },
}
