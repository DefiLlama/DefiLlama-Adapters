const { cachedGraphQuery } = require('../helper/cache')

const config = {
  base: {
    subgraphs: [
      {
        url: 'https://api.goldsky.com/api/public/project_cmktm2w8l5s0k01u9fz2yetrw/subgraphs/alphix-hook-mainnet/prod/gn',
        hooks: [
          '0x0e4b892df7c5bcf5010faf4aa106074e555660c0', // Alphix (USDS/USDC)
        ],
        reHyp: true,
      },
      {
        url: 'https://api.goldsky.com/api/public/project_cmktm2w8l5s0k01u9fz2yetrw/subgraphs/alphix-base-lvrfee/Prod/gn',
        hooks: [
          '0x7cbbff9c4fcd74b221c535f4fb4b1db04f1b9044', // AlphixLVRFee (ETH/USDC, ETH/cbBTC)
        ],
        reHyp: false,
      },
    ],
  },
  arbitrum: {
    subgraphs: [
      {
        url: 'https://api.goldsky.com/api/public/project_cmktm2w8l5s0k01u9fz2yetrw/subgraphs/alphix-arbitrum/prod/gn',
        hooks: [
          '0x5e645c3d580976ca9e3fe77525d954e73a0ce0c0',
        ],
        reHyp: true,
      },
    ],
  },
}

const poolQuery = `{
  pools(first: 1000) {
    hooks
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
  const { subgraphs } = config[chain]

  for (const sg of subgraphs) {
    const hookSet = new Set(sg.hooks)

    // 1. Rehypothecated capital — on-chain via hook's getAmountInYieldSource
    if (sg.reHyp) {
      for (const hook of sg.hooks) {
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
    }

    // 2. Pool liquidity — from subgraph (filtered to Alphix-managed pools)
    const { pools } = await cachedGraphQuery(`alphix/${chain}/${sg.hooks[0]}`, sg.url, poolQuery)
    for (const pool of pools) {
      if (!hookSet.has(pool.hooks.toLowerCase())) continue
      const decimals0 = Number(pool.token0.decimals)
      const decimals1 = Number(pool.token1.decimals)
      api.add(pool.token0.id, toRaw(pool.totalValueLockedToken0, decimals0))
      api.add(pool.token1.id, toRaw(pool.totalValueLockedToken1, decimals1))
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
