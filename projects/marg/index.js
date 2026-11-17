const { get } = require('../helper/http')
const { call } = require('../helper/chain/ton')
const { transformDexBalances } = require('../helper/portedTokens')
const ADDRESSES = require('../helper/coreAssets.json')
const { sleep } = require('../helper/utils')

// Marg DEX (marg.lol): concentrated-liquidity AMM on TON with native TON as the quote asset.
// Contract source: https://github.com/imfromthefuture/marg
// The pool addresses come from the Marg indexer; every reserve is read on-chain from the pool's
// get_pool_state getter (stack: token0, token1, tickSpacing, ext, initialized, sqrtPriceX96, tick,
// liquidity, feeGrowth0X128, feeGrowth1X128, reserve0, reserve1, ...).
const POOLS_API = 'https://marg.lol/api/idx/defillama/pools'

const num = (item) => BigInt(item[1]).toString()

async function tvl() {
  const { pools } = await get(POOLS_API)
  const data = []
  for (const p of pools) {
    const stack = await call({ target: p.pool, abi: 'get_pool_state', rawStack: true })
    data.push({
      token0: ADDRESSES.ton.TON, // token0 is always native TON (Gram) on Marg
      token1: p.token1,
      token0Bal: num(stack[10]),
      token1Bal: num(stack[11]),
    })
    await sleep(1000)
  }
  return transformDexBalances({ chain: 'ton', data })
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  methodology: 'TVL is the sum of the reserves of all active Marg DEX pools, read on-chain from each pool contract (get_pool_state). Launchpad tokens are valued through their TON side.',
  ton: { tvl },
}
