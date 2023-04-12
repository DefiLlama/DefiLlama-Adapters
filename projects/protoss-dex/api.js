
const { call, multiCall, parseAddress } = require('../helper/chain/starknet')
const abi = require('./abi')
const { transformDexBalances } = require('../helper/portedTokens')
const { getParamCalls } = require('../helper/utils')

async function tvl() {
  const factory = '0x04bd9ec70e3ee64fe0adefe0ae4eff797fe07b6fe19d72438db0b6d336ee77c8'
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
