const { sumTokens } = require('../helper/chain/stacks')
const { call } = require('../helper/chain/stacks-api')
const { transformDexBalances } = require('../helper/portedTokens')
const { sleep } = require('../helper/utils')
const sdk = require('@defillama/sdk')

const factory = 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.univ2-core'
const factory2 = 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.univ2-registry_v1_0_0'
const stableFactory = 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.curve-registry_v1_1_0'

module.exports = {
  stacks: { tvl }
}

async function tvl(api) {
  await uniTvl(api, stableFactory, { isStable: true })
  await uniTvl(api, factory)
  await uniTvl(api, factory2, { isVersion2: true })
  return api.getBalances()
}


async function uniTvl(api, factory, { isStable = false, isVersion2 = false } = {}) {
  const data = []
  const pairCount = +(await call({ target: factory, abi: 'get-nr-pools' })).toString()
  for (let i = 1; i <= pairCount; i++) {
    let res
    if (isVersion2) {
      const pairData = res = await call({ target: factory, abi: 'get-pool', inputArgs: [{ type: 'uint', value: i }] })
      res = await call({ target: pairData.value.contract.value, abi: 'do-get-pool'})
    } else {
      res = await call({ target: factory, abi: 'do-get-pool', inputArgs: [{ type: 'uint', value: i }] })
    }

    const { token0, token1, reserve0, reserve1, ...rest } = res
    if (isStable) {
      await sumTokens({ owner: rest.contract.value, balances: api.getBalances() })
    }
    else
      data.push({
        token0: token0.value,
        token1: token1.value,
        token0Bal: reserve0?.value,
        token1Bal: reserve1?.value,
      })
    sdk.log(`velar-amm: ${i}/${pairCount}`)
    await sleep(3100)
  }
  return transformDexBalances({ chain: 'stacks', data, balances: api.getBalances() })
}