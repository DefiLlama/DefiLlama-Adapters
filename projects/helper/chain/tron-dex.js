const { transformDexBalances } = require("../portedTokens")
const { call, multicall, fromHex } = require("./tron")
const sdk = require('@defillama/sdk')


function tronDex({ factory }) {
  return async () => {
    const pairsLength = await call({ target: factory, abi: 'allPairsLength()', resTypes: ['number'] })
    sdk.log('Pair length', pairsLength)
    const pairCalls = []
    for (let i = 0; i < pairsLength; i++) pairCalls.push([{ type: 'uint256', value: i }])
    const pairs = await multicall({ calls: pairCalls, target: factory, abi: 'allPairs(uint256)', resTypes: ['address'], })
    const token0s = await multicall({ calls: pairs, abi: 'token0()', resTypes: ['address'], })
    const token1s = await multicall({ calls: pairs, abi: 'token1()', resTypes: ['address'], })
    const reserves = await multicall({ calls: pairs, abi: 'getReserves()', complexDecodeRes: ['uint112', 'uint112', 'uint32'], })
    const data = reserves.map(([reserve0, reserve1], i) => {
      return {
        token0: token0s[i],
        token1: token1s[i],
        token0Bal: +reserve0,
        token1Bal: +reserve1,
      }
    })
    return transformDexBalances({ chain: 'tron', data })
  }
}

module.exports = {
  tronDex
}