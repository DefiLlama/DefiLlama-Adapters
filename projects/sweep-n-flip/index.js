/**
 * Sweep n' Flip — DeFiLlama TVL adapter
 *
 * SnF is a Uniswap-V2 fork adapted for NFTs. Each NFT pool is a CPMM 50/50 pair where one
 * side is a WERC721 wrapper (1 NFT = 1e18 wrapper units) that DeFiLlama's price oracle cannot
 * price. Because the pool's own spot price is balanceFungible / balanceNFT, the NFT side's value
 * AT THE POOL PRICE equals the fungible side. So TVL = (priceable fungible balance) × 2.
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

 * Data verified 2026-06-01 from snf-contracts/subgraph/config/*.json + DeFiLlama helper/chains.json.
 */

// `start` = first pool creation date per chain (verified via subgraph Pair.createdAtTimestamp) —
// bounds historical runs so DeFiLlama doesn't call allPairsLength before the factory existed.
// `factories` lists every SnF factory live on the chain: the current deployment plus any legacy deployments

const { transformDexBalances } = require('../helper/portedTokens');

const config = {
  ethereum:    { factories: ['0x85039B2e95558aDdCCf4379728b8433C447E37bE', '0x16eD649675e6Ed9F1480091123409B4b8D228dC1'], fromBlock: 24882293,  start: '2026-04-15' },
  base:        { factories: ['0x611103410C8021B51725ab38Cc79C8F0feD715c6'], fromBlock: 37314429,  start: '2025-10-25' },
  arbitrum:    { factories: ['0x85039B2e95558aDdCCf4379728b8433C447E37bE', '0x16eD649675e6Ed9F1480091123409B4b8D228dC1'], fromBlock: 452826927, start: '2026-04-15' },
  polygon:     { factories: ['0x85039B2e95558aDdCCf4379728b8433C447E37bE', '0x16eD649675e6Ed9F1480091123409B4b8D228dC1'], fromBlock: 85577619,  start: '2026-04-15' },
  hyperliquid: { factories: ['0xa575959Ab114BF3a84A9B7D92838aC3b77324E65'], fromBlock: 11741392,  start: '2025-08-23' },
  apechain:    { factories: ['0x85039B2e95558aDdCCf4379728b8433C447E37bE'], fromBlock: 37153586,  start: '2026-04-28' },
  berachain:   { factories: ['0x85039B2e95558aDdCCf4379728b8433C447E37bE'], fromBlock: 20200289,  start: '2026-04-28' },
  monad:       { factories: ['0x85039B2e95558aDdCCf4379728b8433C447E37bE'], fromBlock: 71175180,  start: '2026-04-28' },
  mode:        { factories: ['0x7962223D940E1b099AbAe8F54caBFB8a3a0887AB'], fromBlock: 6989680,   start: '2024-06-01' },
}

async function tvl(api) {
  const { factories } = config[api.chain]

  // Enumerate every pair across all SnF factories via the standard UniV2
  // allPairs/allPairsLength getters, then flatten into one list.
  const pairs = (await Promise.all(
    factories.map((factory) => api.fetchList({ lengthAbi: 'allPairsLength', itemAbi: 'allPairs', target: factory }))
  )).flat()

  // Probe discrete flags with permitFailure — DELEGATE (foreign upstream-DEX) pairs revert and
  // come back null; they're excluded. Only SnF NFT pools have exactly one discrete side.
  const [discrete0s, discrete1s] = await Promise.all([
    api.multiCall({ abi: 'bool:discrete0', calls: pairs, permitFailure: true }),
    api.multiCall({ abi: 'bool:discrete1', calls: pairs, permitFailure: true }),
  ])

  const nftPairs = [] // SnF NFT pools only
  pairs.forEach((pair, i) => {
    const d0 = discrete0s[i]
    const d1 = discrete1s[i]
    if (d0 === null || d1 === null) return // delegate/foreign pair → not SnF liquidity
    // exactly one discrete side = a real SnF NFT pool; both-true (factory forbids) or both-false (delegate) → skip
    if (d0 !== d1) nftPairs.push(pair)
  })
  if (!nftPairs.length) return

  const [token0s, token1s] = await Promise.all([
    api.multiCall({ abi: 'address:token0', calls: nftPairs }),
    api.multiCall({ abi: 'address:token1', calls: nftPairs }),
  ])

  const [bals0, bals1] = await Promise.all([
    api.multiCall({ abi: 'erc20:balanceOf', calls: nftPairs.map((pair, i) => ({ target: token0s[i], params: pair })) }),
    api.multiCall({ abi: 'erc20:balanceOf', calls: nftPairs.map((pair, i) => ({ target: token1s[i], params: pair })) }),
  ])

  const data = nftPairs
    .map((_, i) => ({ token0: token0s[i], token0Bal: bals0[i], token1: token1s[i], token1Bal: bals1[i] }))
    // Skip one-sided/empty pools so a lone non-zero side can't be doubled into phantom TVL.
    .filter((d) => BigInt(d.token0Bal) !== 0n && BigInt(d.token1Bal) !== 0n)

  return transformDexBalances({ chain: api.chain, data })
}

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl, start: config[chain].start }
})
module.exports.misrepresentedTokens = true
module.exports.methodology =
  "TVL is the value locked across Sweep n' Flip's CPMM NFT pools. Each NFT pool pairs a fungible " +
  'asset (ETH/stablecoin/native) with a WERC721 NFT wrapper. The wrapper is not oracle-priceable, ' +
  "so the pool's fungible balance is counted and doubled (×2) — in a constant-product 50/50 pool " +
  "the NFT side's value at the pool's own spot price equals the fungible side. Only native SnF NFT " +
  'pools are counted; delegate (fungible/fungible) pairs route to an upstream DEX and are excluded. ' +
  'Pairs with a zero-balance side are skipped.'
