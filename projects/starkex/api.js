const ADDRESSES = require('../helper/coreAssets.json')

const { call, multiCall, parseAddress } = require('../helper/chain/starknet')
const abi = require('./abi')
const { transformDexBalances } = require('../helper/portedTokens')
const { getParamCalls } = require('../helper/utils')

async function tvl() {
  const factory = '0x07df3bce30857e8f9c08bcd9d9668df34166e94dd968db6e2920b870c4410e34'
  let pairLength = await call({ target: factory, abi: abi.factory.allPairsLength})
  let pairs = await multiCall({ abi: abi.factory.allPairs, target: factory, calls: getParamCalls(+pairLength)})
  
  const calls = pairs.map(i => parseAddress(i)).filter(i => i !== '0x0000000000000000000000000000000000000000000000000000000000000000')
  
  const token0s = await multiCall({ abi: abi.pair.token0, calls })
  const token1s = await multiCall({ abi: abi.pair.token1, calls })
  const reserves = await multiCall({ abi: abi.pair.getReserves, calls })

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
