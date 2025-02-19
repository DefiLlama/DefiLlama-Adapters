const { call } = require('../helper/chain/stacks-api')
const { transformDexBalances } = require('../helper/portedTokens')
const { getCache, setCache, } = require('../helper/cache')
const { sleep } = require('../helper/utils')
const sdk = require('@defillama/sdk')

const factory = 'SP1Z92MPDQEWZXW36VX71Q25HKF5K2EPCJ304F275.stackswap-swap-v5k'

module.exports = {
  stacks: { tvl }
}

async function tvl(api) {
  const data = []
  const { value: pairCount } = await call({ target: factory, abi: 'get-pair-count' })
  const cache = await getCache('stackswap', 'stacks-config')
  if (!cache.pairData) cache.pairData = []
  for (let i = cache.pairData.length +1; i <= pairCount; i++) {
    const pair = await call({ target: factory, abi: 'get-pair-contracts', inputArgs: [{ type: 'number', value: i }] })
    cache.pairData.push(pair)
  }

  await setCache('stackswap', 'stacks-config', cache)
  let i = 0
  for (const pair of cache.pairData) {
    if (pair['liquidity-token'].value === 'SP1Z92MPDQEWZXW36VX71Q25HKF5K2EPCJ304F275.liquidity-token-v5krqbd8nh6') continue // ignore STSW-lBTC
    const pairData = await call({ target: pair['liquidity-token'].value, abi: 'get-lp-data', })
    data.push({
      token0: pair['token-x'].value,
      token1: pair['token-y'].value,
      token0Bal: +pairData.value['balance-x'].value + +pairData.value['fee-balance-x'].value,
      token1Bal: +pairData.value['balance-y'].value + +pairData.value['fee-balance-y'].value,
    })
    sdk.log(`stackswap: ${++i}/${pairCount}`) 
    await sleep(2100)
  }
  return transformDexBalances({ chain: 'stacks', data})
}