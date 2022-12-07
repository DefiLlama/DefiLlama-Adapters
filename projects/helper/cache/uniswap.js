
const uniswapAbi = require('../abis/uniswap')
const { getCache, setCache, } = require('../cache');
const { transformBalances, transformDexBalances, } = require('../portedTokens')
const { getCoreAssets, } = require('../tokenMapping')
const sdk = require('@defillama/sdk')

function getUniTVL({ chain = 'ethereum', coreAssets, blacklist = [], factory,
  useDefaultCoreAssets = false,
  abis = {},
}) {
  if (!coreAssets && useDefaultCoreAssets)
    coreAssets = getCoreAssets(chain)
  const abi = { ...uniswapAbi, ...abis }

  return async (ts, _block, { [chain]: block }) => {
    const data = []
    const balances = {}
    const length = await sdk.api2.abi.call({ abi: abi.allPairsLength, target: factory, chain, block, })
    sdk.log(chain, ' No. of pairs: ', length)
    const pairCalls = []
    for (let i = 0; i < length; i++)
      pairCalls.push(i)

    const calls = await sdk.api2.abi.multiCall({ block, chain, abi: abi.allPairs, calls: pairCalls, target: factory })
    const token0s = await sdk.api2.abi.multiCall({ abi: abi.token0, chain, block, calls })
    const token1s = await sdk.api2.abi.multiCall({ abi: abi.token1, chain, block, calls })
    const reserves = await sdk.api2.abi.multiCall({ abi: abi.getReserves, chain, block, calls })


    reserves.forEach(({ _reserve0, _reserve1 }, i) => {
      sdk.util.sumSingleBalance(balances, token0s[i], _reserve0)
      sdk.util.sumSingleBalance(balances, token1s[i], _reserve1)
      data.push({
        token0: token0s[i],
        token1: token1s[i],
        token1Bal: _reserve1,
        token0Bal: _reserve0,
      })
    })


    if (coreAssets)
      return transformDexBalances({ chain, data, coreAssets, blacklistedTokens: blacklist })
    
    return transformBalances(chain, balances)
  }
}

module.exports = {
  getUniTVL
}