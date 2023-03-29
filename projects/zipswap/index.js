const { getUniTVL } = require('../helper/unknownTokens')
const { transformDexBalances } = require('../helper/portedTokens')
const uniswapAbi = require('../helper/abis/uniswap')
const sdk = require('@defillama/sdk')

async function opTvl(_, _b, {optimism: block}) {
  const chain = 'optimism'
  const factory = '0x8BCeDD62DD46F1A76F8A1633d4f5B76e0CDa521E'
  const data = []
  const length = await sdk.api2.abi.call({ abi: uniswapAbi.allPairsLength, target: factory, chain, block, })
  const pairCalls = []
  for (let i = 0; i < length;i++) 
    if (i !== 67) pairCalls.push(i)

  const calls = await sdk.api2.abi.multiCall({ block, chain, abi: uniswapAbi.allPairs, calls: pairCalls, target: factory })
  const token0s = await sdk.api2.abi.multiCall({ abi: uniswapAbi.token0, chain, block, calls })
  const token1s = await sdk.api2.abi.multiCall({ abi: uniswapAbi.token1, chain, block, calls })
  const reserves = await sdk.api2.abi.multiCall({ abi: uniswapAbi.getReserves, chain, block, calls })
  reserves.forEach(({ _reserve0, _reserve1}, i) => {
    data.push({
      token0: token0s[i],
      token1: token1s[i],
      token1Bal: _reserve1,
      token0Bal: _reserve0,
    })
  })
  return transformDexBalances({ chain, data, })
}

module.exports = {
  misrepresentedTokens: true,
  optimism: {
    tvl: opTvl,
  },
  arbitrum: {
    tvl: getUniTVL({
      chain: 'arbitrum',
      factory: '0x9e343Bea27a12B23523ad88333a1B0f68cc1F05E',
      useDefaultCoreAssets: true,
    }),
  },
  methodology:
    "Factory addresses on Optimism and Arbitrum are used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
};
