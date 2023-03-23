// https://www.starknetjs.com/docs/API/contract

const { call, multiCall, parseAddress } = require('../helper/chain/starknet')
const abi = require('./abi')
const { transformDexBalances } = require('../helper/portedTokens')

async function tvl() {
  const factory = '0xdad44c139a476c7a17fc8141e6db680e9abc9f56fe249a105094c44382c2fd'
  let { all_pairs } = await call({ target: factory, abi: abi.factory.get_all_pairs})

  const calls = all_pairs.map(i => parseAddress(i))
  const [ token0s, token1s, reserves ] = await Promise.all([
    multiCall({ abi: abi.pair.token0, calls }),
    multiCall({ abi: abi.pair.token1, calls }),
    multiCall({ abi: abi.pair.get_reserves, calls }),
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