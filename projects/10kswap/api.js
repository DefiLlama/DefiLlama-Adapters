
const { call, multiCall, parseAddress } = require('../helper/chain/starknet')
const abi = require('./abi')
const { transformDexBalances } = require('../helper/portedTokens')
const { getParamCalls } = require('../helper/utils')

async function tvl() {
  const factory = '0x1c0a36e26a8f822e0d81f20a5a562b16a8f8a3dfd99801367dd2aea8f1a87a2'
  let pairLength = await call({ target: factory, abi: abi.factory.allPairsLength})
  let pairs = await multiCall({ abi: abi.factory.allPairs, target: factory, calls: getParamCalls(+pairLength)})
  
  const calls = pairs.map(i => parseAddress(i))
  
  const [ token0s, token1s, reserves ] = await Promise.all([
    multiCall({ abi: abi.pair.token0, calls }),
    multiCall({ abi: abi.pair.token1, calls }),
    multiCall({ abi: abi.pair.getReserves, calls }),
  ])

  const data = []
  reserves.forEach((reserve, i) => {
    data.push({
      token0: parseAddress(token0s[i]),
      token1: parseAddress(token1s[i]),
      token0Bal: +reserve.reserve0,
      token1Bal: +reserve.reserve1,
    })
  })

  return transformDexBalances({chain:'starknet', data})
}

module.exports = {
  timetravel: false,
  starknet: {
    tvl,
  }
}