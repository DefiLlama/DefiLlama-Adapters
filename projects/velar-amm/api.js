const { call } = require('../helper/chain/stacks-api')
const { transformDexBalances } = require('../helper/portedTokens')
const { sleep } = require('../helper/utils')
const sdk = require('@defillama/sdk')

const factory = 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.univ2-core'

module.exports = {
  stacks: { tvl }
}

async function tvl() {
  const data = []
  const pairCount = +(await call({ target: factory, abi: 'get-nr-pools' })).toString()
  for (let i = 1; i <= pairCount; i++) {
    const {
      token0, token1, reserve0, reserve1,
    } = await call({ target: factory, abi: 'do-get-pool', inputArgs: [{ type: 'uint', value: i }] })
    data.push({
      token0: token0.value,
      token1: token1.value,
      token0Bal: reserve0.value,
      token1Bal: reserve1.value,
    })
    sdk.log(`velar-amm: ${i}/${pairCount}`)
    await sleep(2100)
  }
  return transformDexBalances({ chain: 'stacks', data })
}