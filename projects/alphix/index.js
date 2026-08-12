const sdk = require('@defillama/sdk')
const { cachedGraphQuery } = require('../helper/cache')

// Official Uniswap V4 subgraph IDs (used for fee-only hooks)
const uniV4GraphIds = {
  base: 'Gqm2b5J85n1bhCyDMpGbtbVn4935EvvdyHdHrx3dibyj',
}

const config = {
  base: {
    // Rehypothecation hooks (Alphix) — queried via custom Goldsky subgraph
    reHypSubgraph: 'https://api.goldsky.com/api/public/project_cmktm2w8l5s0k01u9fz2yetrw/subgraphs/alphix-hook-mainnet/prod/gn',
    reHypHooks: [
      '0x0e4b892df7c5bcf5010faf4aa106074e555660c0', // Alphix (USDS/USDC)
    ],
    // Fee-only hooks (AlphixLVRFee, AlphixPro) — queried via official Uniswap V4 subgraph
    feeHooks: [
      '0x7cbbff9c4fcd74b221c535f4fb4b1db04f1b9044', // AlphixLVRFee (ETH/USDC, ETH/cbBTC)
      '0x2f9cf87a6cbfa53c3f1b184900de17298e3f9080', // AlphixPro (ETH/ZFI)
    ],
  },
  arbitrum: {
    reHypSubgraph: 'https://api.goldsky.com/api/public/project_cmktm2w8l5s0k01u9fz2yetrw/subgraphs/alphix-arbitrum/prod/gn',
    reHypHooks: [
      '0x5e645c3d580976ca9e3fe77525d954e73a0ce0c0',
    ],
    feeHooks: [],
  },
}

const reHypPoolQuery = `{
  pools(first: 1000) {
    hooks
    token0 { id decimals }
    token1 { id decimals }
    totalValueLockedToken0
    totalValueLockedToken1
  }
}`

const uniV4PoolQuery = (hook) => `{
  pools(where: { hooks: "${hook.toLowerCase()}" }, orderBy: totalValueLockedUSD, orderDirection: desc, first: 999) {
    token0 { id decimals }
    token1 { id decimals }
    totalValueLockedToken0
    totalValueLockedToken1
  }
}`

// Convert human-readable decimal string to raw BigInt
function toRaw(decimalStr, decimals) {
  const [whole = '0', frac = ''] = decimalStr.split('.')
  const paddedFrac = frac.slice(0, decimals).padEnd(decimals, '0')
  return BigInt(whole + paddedFrac)
}

async function tvl(api) {
  const chain = api.chain
  const { reHypSubgraph, reHypHooks, feeHooks } = config[chain]

  // 1. Rehypothecation hooks: on-chain yield + custom subgraph for vanilla LP positions
  for (const hook of reHypHooks) {
    const poolKey = await api.call({
      abi: 'function getPoolKey() view returns (address, address, uint24, int24, address)',
      target: hook,
    })
    const currencies = [poolKey[0], poolKey[1]]
    const amounts = await api.multiCall({
      abi: 'function getAmountInYieldSource(address) view returns (uint256)',
      calls: currencies.map(c => ({ target: hook, params: [c] })),
    })
    api.addTokens(currencies, amounts)
  }

  if (reHypHooks.length) {
    const hookSet = new Set(reHypHooks)
    const { pools } = await cachedGraphQuery(`alphix/${chain}/rehyp`, reHypSubgraph, reHypPoolQuery)
    for (const pool of pools) {
      if (!hookSet.has(pool.hooks.toLowerCase())) continue
      const decimals0 = Number(pool.token0.decimals)
      const decimals1 = Number(pool.token1.decimals)
      api.add(pool.token0.id, toRaw(pool.totalValueLockedToken0, decimals0))
      api.add(pool.token1.id, toRaw(pool.totalValueLockedToken1, decimals1))
    }
  }

  // 2. Fee-only hooks: queried via official Uniswap V4 subgraph
  if (feeHooks.length) {
    if (!uniV4GraphIds[chain]) throw new Error(`No Uniswap V4 subgraph configured for chain ${chain}`)
    for (const hook of feeHooks) {
      const { pools } = await sdk.graph.request(uniV4GraphIds[chain], uniV4PoolQuery(hook))
      for (const pool of pools) {
        const decimals0 = Number(pool.token0.decimals)
        const decimals1 = Number(pool.token1.decimals)
        api.add(pool.token0.id, toRaw(pool.totalValueLockedToken0, decimals0))
        api.add(pool.token1.id, toRaw(pool.totalValueLockedToken1, decimals1))
      }
    }
  }
}

module.exports = {
  methodology: 'TVL is the sum of assets rehypothecated into ERC-4626 yield vaults by Alphix hooks (queried on-chain) plus vanilla Uniswap V4 LP positions in Alphix-managed pools (queried via subgraph).',
  doublecounted: true,
  start: '2026-02-11',
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})
