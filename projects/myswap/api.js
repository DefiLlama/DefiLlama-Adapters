const { call, multiCall, parseAddress } = require('../helper/chain/starknet')
const { transformDexBalances } = require('../helper/portedTokens')
const { factoryAbi, allAbi, } = require('./abi')

async function tvl() {
  const factory = '0x010884171baf1914edc28d7afb619b40a4051cfae78a094a55d230f19e944a28'
  let pairCount = await call({ target: factory, abi: factoryAbi.get_total_number_of_pools})
  pairCount = +pairCount
  const calls = []

  for (let i = 1; i <= pairCount; i++)  calls.push(i)
  const reserves = await multiCall({ abi: factoryAbi.get_pool, calls, allAbi, target: factory, })

  const data = []
  reserves.forEach((reserve) => {
    data.push({
      token0: parseAddress(reserve.token_a_address),
      token1: parseAddress(reserve.token_b_address),
      token0Bal: reserve.token_a_reserves.low.toString(),
      token1Bal: reserve.token_b_reserves.low.toString(),
    })
  })

  return transformDexBalances({chain:'starknet', data})
}

module.exports = {
  hallmarks: [[1747094400, 'Sunset of MySwap']],
  deadFrom: '2025-05-13',
  timetravel: false,
  starknet: { tvl }
}
