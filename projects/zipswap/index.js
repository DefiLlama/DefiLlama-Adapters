const { getUniTVL } = require('../helper/unknownTokens')
const { transformDexBalances } = require('../helper/portedTokens')
const uniswapAbi = require('../helper/abis/uniswap')

async function opTvl(api) {
  const factory = '0x8BCeDD62DD46F1A76F8A1633d4f5B76e0CDa521E'
  const data = []
  const length = await api.call({ abi: uniswapAbi.allPairsLength, target: factory, })
  const pairCalls = []
  for (let i = 0; i < length; i++)
    if (i !== 67) pairCalls.push(i)

  const calls = await api.multiCall({ abi: uniswapAbi.allPairs, calls: pairCalls, target: factory })
  const token0s = await api.multiCall({ abi: uniswapAbi.token0, calls })
  const token1s = await api.multiCall({ abi: uniswapAbi.token1, calls })
  const reserves = await api.multiCall({ abi: uniswapAbi.getReserves, calls })
  reserves.forEach(({ _reserve0, _reserve1 }, i) => {
    data.push({
      token0: token0s[i],
      token1: token1s[i],
      token1Bal: _reserve1,
      token0Bal: _reserve0,
    })
  })
  return transformDexBalances({ api, data, })
}

module.exports = {
  misrepresentedTokens: true,
  optimism: {
    tvl: opTvl,
  },
  arbitrum: {
    tvl: getUniTVL({
      factory: '0x9e343Bea27a12B23523ad88333a1B0f68cc1F05E',
      useDefaultCoreAssets: true,
    }),
  },
  methodology:
    "Factory addresses on Optimism and Arbitrum are used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
};
