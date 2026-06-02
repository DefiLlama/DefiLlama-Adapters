/**
 * Sweep n' Flip — DeFiLlama TVL adapter (DRAFT)
 *
 * Target repo: DefiLlama/DefiLlama-Adapters  →  projects/sweep-n-flip/index.js
 *
 * SnF is a Uniswap-V2 fork adapted for NFTs. Each NFT pool is a CPMM 50/50 pair where one
 * side is a WERC721 wrapper (1 NFT = 1e18 wrapper units) that DeFiLlama's price oracle cannot
 * price. Because the pool's own spot price is reserveFungible / reserveNFT, the NFT side's value
 * AT THE POOL PRICE equals the fungible side. So TVL = (priceable fungible reserve) × 2.
 * This is the accepted DeFiLlama convention for pools with exactly one unpriceable token.
 *
 * Pair NFT-detection is exact, not heuristic: the SnF pair exposes public `discrete0()`/
 * `discrete1()` booleans (true = that side is an NFT wrapper). Verified in
 * snf-contracts/contracts/core/UniswapV2Pair.sol.
 *
 * IMPORTANT: SnF's factory `allPairs` ALSO lists DELEGATE pairs — fungible/fungible pairs whose
 * stored address is an UPSTREAM DEX pair (Sushi/Pancake/Camelot/etc), not an SnF contract. Those
 * have no `discrete0/discrete1` getters (call reverts) and are NOT SnF liquidity (they route to the
 * upstream DEX). So we probe discrete0/discrete1 with permitFailure and count ONLY real NFT pools
 * (exactly one discrete side). Verified in UniswapV2Factory.sol:createPair (the `else` delegate branch).
 *
 * ── BEFORE OPENING THE PR ───────────────────────────────────────────────────────────────────
 *  1. Run `node test.js projects/sweep-n-flip` inside the DefiLlama-Adapters fork.
 *  2. Confirm per-token PRICE coverage on the emerging chains (WHYPE/WMON/WAPE/WBERA). If a
 *     chain's fungible token has no DeFiLlama price source, that chain's TVL reads 0 until they
 *     add it — document, don't hack a self-price.
 *  3. Confirm `api.fetchList` enumeration scales on Arbitrum/Polygon (largest pair counts).
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 *
 * Data verified 2026-06-01 from snf-contracts/subgraph/config/*.json + DeFiLlama helper/chains.json.
 * NOTE: HyperEVM's DeFiLlama chain key is `hyperliquid`, NOT "hyperevm".
 */

// `start` = first pool creation date per chain (verified via subgraph Pair.createdAtTimestamp) —
// bounds historical runs so DeFiLlama doesn't call allPairsLength before the factory existed.
const config = {
  ethereum:    { factory: '0x85039B2e95558aDdCCf4379728b8433C447E37bE', fromBlock: 24882293,  start: '2026-04-15' },
  base:        { factory: '0x611103410C8021B51725ab38Cc79C8F0feD715c6', fromBlock: 37314429,  start: '2025-10-25' },
  arbitrum:    { factory: '0x85039B2e95558aDdCCf4379728b8433C447E37bE', fromBlock: 452826927, start: '2026-04-15' },
  polygon:     { factory: '0x85039B2e95558aDdCCf4379728b8433C447E37bE', fromBlock: 85577619,  start: '2026-04-15' },
  hyperliquid: { factory: '0xa575959Ab114BF3a84A9B7D92838aC3b77324E65', fromBlock: 11741392,  start: '2025-08-23' },
  apechain:    { factory: '0x85039B2e95558aDdCCf4379728b8433C447E37bE', fromBlock: 37153586,  start: '2026-04-28' },
  berachain:   { factory: '0x85039B2e95558aDdCCf4379728b8433C447E37bE', fromBlock: 20200289,  start: '2026-04-28' },
  monad:       { factory: '0x85039B2e95558aDdCCf4379728b8433C447E37bE', fromBlock: 71175180,  start: '2026-04-28' },
}

const RESERVES_ABI =
  'function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)'

async function tvl(api) {
  const { factory } = config[api.chain]

  // Enumerate every pair via the standard UniV2 allPairs/allPairsLength getters.
  const pairs = await api.fetchList({ lengthAbi: 'allPairsLength', itemAbi: 'allPairs', target: factory })

  // Probe discrete flags with permitFailure — DELEGATE (foreign upstream-DEX) pairs revert and
  // come back null; they're excluded. Only SnF NFT pools have exactly one discrete side.
  const [discrete0s, discrete1s] = await Promise.all([
    api.multiCall({ abi: 'bool:discrete0', calls: pairs, permitFailure: true }),
    api.multiCall({ abi: 'bool:discrete1', calls: pairs, permitFailure: true }),
  ])

  const nftPairs = [] // SnF NFT pools only
  const fungibleSide = [] // 0 or 1 — which side of the pair is the priceable fungible token
  pairs.forEach((pair, i) => {
    const d0 = discrete0s[i]
    const d1 = discrete1s[i]
    if (d0 === null || d1 === null) return // delegate/foreign pair → not SnF liquidity
    if (d0 && !d1) { nftPairs.push(pair); fungibleSide.push(1) } // token1 is fungible
    else if (!d0 && d1) { nftPairs.push(pair); fungibleSide.push(0) } // token0 is fungible
    // both true (factory forbids) or both false (delegate) → skip
  })
  if (!nftPairs.length) return

  const [token0s, token1s, reserves] = await Promise.all([
    api.multiCall({ abi: 'address:token0', calls: nftPairs }),
    api.multiCall({ abi: 'address:token1', calls: nftPairs }),
    api.multiCall({ abi: RESERVES_ABI, calls: nftPairs }),
  ])

  nftPairs.forEach((pair, i) => {
    const r = reserves[i]
    const reserve0 = BigInt(r.reserve0 ?? r[0])
    const reserve1 = BigInt(r.reserve1 ?? r[1])
    // Skip one-sided/empty pools — if either side is 0 the ×2 doubling would overstate TVL.
    if (reserve0 === 0n || reserve1 === 0n) return

    // Double the fungible reserve to value the whole CPMM 50/50 pool.
    if (fungibleSide[i] === 1) {
      api.add(token1s[i], (reserve1 * 2n).toString())
    } else {
      api.add(token0s[i], (reserve0 * 2n).toString())
    }
  })
}

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl, start: config[chain].start }
})

module.exports.methodology =
  "TVL is the value locked across Sweep n' Flip's CPMM NFT pools. Each NFT pool pairs a fungible " +
  'asset (ETH/stablecoin/native) with a WERC721 NFT wrapper. The wrapper is not oracle-priceable, ' +
  "so the pool's fungible reserve is counted and doubled (×2) — in a constant-product 50/50 pool " +
  "the NFT side's value at the pool's own spot price equals the fungible side. Only native SnF NFT " +
  'pools are counted; delegate (fungible/fungible) pairs route to an upstream DEX and are excluded. ' +
  'Pairs with zero reserves are skipped.'
