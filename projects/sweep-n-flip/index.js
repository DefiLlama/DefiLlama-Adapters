/**
 * Sweep n' Flip — DeFiLlama TVL adapter
 *
 * SnF is a Uniswap-V2 fork adapted for NFTs. Each NFT pool is a CPMM 50/50 pair where one
 * side is a WERC721 wrapper (1 NFT = 1e18 wrapper units) that DeFiLlama's price oracle cannot
 * price. Because the pool's own spot price is balanceFungible / balanceNFT, the NFT side's value
 * AT THE POOL PRICE equals the fungible side. So TVL = (priceable fungible balance) × 2.
 * This is the accepted DeFiLlama convention for pools with exactly one unpriceable token.
 *
 * Pairs are discovered from each factory's `PairCreated` event (cached via getLogs).
 */

const { getLogs } = require('../helper/cache/getLogs')
const { transformDexBalances } = require('../helper/portedTokens')

const PAIR_CREATED = 'event PairCreated(address indexed token0, address indexed token1, address pair, uint256)'

const config = {
  ethereum:    { start: '2026-04-15', factories: [{ factory: '0x85039B2e95558aDdCCf4379728b8433C447E37bE', fromBlock: 24882293 },  { factory: '0x16eD649675e6Ed9F1480091123409B4b8D228dC1', fromBlock: 12965000 }] },
  base:        { start: '2025-10-25', factories: [{ factory: '0x611103410C8021B51725ab38Cc79C8F0feD715c6', fromBlock: 37314429 }] },
  arbitrum:    { start: '2026-04-15', factories: [{ factory: '0x85039B2e95558aDdCCf4379728b8433C447E37bE', fromBlock: 452826927 }, { factory: '0x16eD649675e6Ed9F1480091123409B4b8D228dC1', fromBlock: 101851523 }] },
  polygon:     { start: '2026-04-15', factories: [{ factory: '0x85039B2e95558aDdCCf4379728b8433C447E37bE', fromBlock: 85577619 },  { factory: '0x16eD649675e6Ed9F1480091123409B4b8D228dC1', fromBlock: 12965000 }] },
  hyperliquid: { start: '2025-08-23', factories: [{ factory: '0xa575959Ab114BF3a84A9B7D92838aC3b77324E65', fromBlock: 11741392 }] },
  apechain:    { start: '2026-04-28', factories: [{ factory: '0x85039B2e95558aDdCCf4379728b8433C447E37bE', fromBlock: 37153586 }] },
  berachain:   { start: '2026-04-28', factories: [{ factory: '0x85039B2e95558aDdCCf4379728b8433C447E37bE', fromBlock: 20200289 }] },
  monad:       { start: '2026-04-28', factories: [{ factory: '0x85039B2e95558aDdCCf4379728b8433C447E37bE', fromBlock: 71175180 }] },
  abstract:    { start: '2026-06-15', factories: [{ factory: '0x4a1775B76D9d4260C60f3376eCDA618e316c662D', fromBlock: 70255154 }] },
  ronin:       { start: '2026-06-15', factories: [{ factory: '0x85039B2e95558aDdCCf4379728b8433C447E37bE', fromBlock: 57049023 }] },
  mode:        { start: '2024-06-01', factories: [{ factory: '0x7962223D940E1b099AbAe8F54caBFB8a3a0887AB', fromBlock: 6989680 }] },
}

async function tvl(api) {
  const { factories } = config[api.chain]

  // PairCreated gives pair + token0/token1 directly
  const logs = (await Promise.all(
    factories.map(({ factory, fromBlock }) =>
      getLogs({ api, target: factory, eventAbi: PAIR_CREATED, onlyArgs: true, fromBlock }))
  )).flat()
  if (!logs.length) return

  const pairs = logs.map((log) => log.pair)

  // Keep only real SnF NFT pools: exactly one discrete (NFT-wrapper) side. Delegate/foreign pairs
  // lack discrete0/discrete1 (call reverts → null) and are excluded — hence permitFailure here.
  const [discrete0s, discrete1s] = await Promise.all([
    api.multiCall({ abi: 'bool:discrete0', calls: pairs, permitFailure: true }),
    api.multiCall({ abi: 'bool:discrete1', calls: pairs, permitFailure: true }),
  ])

  const nftLogs = logs.filter((_, i) => {
    const d0 = discrete0s[i]
    const d1 = discrete1s[i]
    return d0 != null && d1 != null && d0 !== d1 // exactly one discrete side = real SnF NFT pool
  })
  if (!nftLogs.length) return

  const [bals0, bals1] = await Promise.all([
    api.multiCall({ abi: 'erc20:balanceOf', calls: nftLogs.map((l) => ({ target: l.token0, params: l.pair })) }),
    api.multiCall({ abi: 'erc20:balanceOf', calls: nftLogs.map((l) => ({ target: l.token1, params: l.pair })) }),
  ])

  const data = nftLogs
    .map((l, i) => ({ token0: l.token0, token0Bal: bals0[i], token1: l.token1, token1Bal: bals1[i] }))
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
