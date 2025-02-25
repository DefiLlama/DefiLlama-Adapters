
const { transformDexBalances } = require('../helper/portedTokens')
const { call } = require('../helper/chain/stacks-api')

const core = 'SP1W7FX8P1G721KQMQ2MA2G1G4WCVVPD9JZMGXK8R.univ2-core'

async function tvl() {
  const data = []
  const pairCount = +(await call({ target: core, abi: 'get-nr-pools' })).toString()
  for (let i = 1; i <= pairCount; i++) {
    const {
      token0, token1, reserve0, reserve1,
    } = await call({ target: core, abi: 'do-get-pool', inputArgs: [{ type: 'uint', value: i }] })
    data.push({
      token0: token0.value,
      token1: token1.value,
      token0Bal: reserve0.value,
      token1Bal: reserve1.value,
    })
  }

  return transformDexBalances({ chain: 'stacks', data })
} 


module.exports = {
  stacks: {
    tvl: tvl,
  }
}
  