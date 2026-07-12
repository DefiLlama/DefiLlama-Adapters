const ADDRESSES = require('../helper/coreAssets.json')
// https://www.starknetjs.com/docs/API/contract

const { call, multiCall, } = require('../helper/chain/starknet')
const abi = require('./abi')
const { transformDexBalances } = require('../helper/portedTokens')
const { getParamCalls } = require('../helper/utils')
async function tvl() {
  const factory = '0xeaf728d8e09bfbe5f11881f848ca647ba41593502347ed2ec5881e46b57a32'
  let pairLength = await call({ target: factory, abi: abi.factory.allPairsLength})
  let pairs = await multiCall({ abi: abi.factory.allPairs, target: factory, calls: getParamCalls(Number(pairLength) + 1)})
  pairs = pairs.filter(i => i !== '0x0000000000000000000000000000000000000000000000000000000000000000')
  const calls = pairs
  const token0s = await multiCall({ abi: abi.pair.getToken0, calls })
  const token1s = await multiCall({ abi: abi.pair.getToken1, calls })
  const reserves0 = await multiCall({ abi: abi.pair.getReserve0, calls })
  const reserves1 = await multiCall({ abi: abi.pair.getReserve1, calls })

  const data = []
  reserves0.forEach((reserve0, i) => {
    data.push({
      token0: token0s[i],
      token1: token1s[i],
      token0Bal: +reserve0,
      token1Bal: +reserves1[i],
    })
  })

  return transformDexBalances({chain:'starknet', data})
}

module.exports = {
  timetravel: false,
  isHeavyProtocol: true,
  starknet: {
    tvl,
  }
}