const { call } = require('../helper/chain/stacks-api')
const { getCache, setCache } = require('../helper/cache')
const { sleep } = require('../helper/utils')
const sdk = require('@defillama/sdk')
const { sumTokens } = require('../helper/chain/stacks')

const factory = 'SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.amm-pool-v2-01'

async function tvl(api) {
  // https://docs.alexgo.io/developers/smart-contracts


  // get simple weight pool data
  const simpleWeightAMM = 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.simple-weight-pool-alex'
  let { value: swPools } = await call({ target: simpleWeightAMM, abi: 'get-pools' })
  swPools = swPools.map(i => i.value)
  for (const { value: pool } of swPools) {
    const inputArgs = ['token-x', 'token-y'].map(key => pool[key])
    const { value: poolData } = await call({ target: simpleWeightAMM, abi: 'get-pool-details', inputArgs })
    api.add(pool['token-x'].value, poolData['balance-x'].value)
    api.add(pool['token-y'].value, poolData['balance-y'].value)
    await sleep(2100)
  }



  // get fixed weight pool data
  const fixedWeightAMM = 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.fixed-weight-pool-v1-01'
  let { value: fwPools } = await call({ target: fixedWeightAMM, abi: 'get-pools' })
  fwPools = fwPools.map(i => i.value)
  for (const { value: pool } of fwPools) {
    const inputArgs = ['token-x', 'token-y', 'weight-x', 'weight-y'].map(key => pool[key])
    const { value: poolData } = await call({ target: fixedWeightAMM, abi: 'get-pool-details', inputArgs })
    api.add(pool['token-x'].value, poolData['balance-x'].value)
    api.add(pool['token-y'].value, poolData['balance-y'].value)
    await sleep(2100)
  }



  // update cache for amm v2 pools & token metadata
  const cache = await getCache('alex/ammv2', 'stacks')
  if (!cache.pairData) cache.pairData = []
  if (!cache.tokenMetadata) cache.tokenMetadata = {}
  const currentPairCount = cache.pairData.length
  let hasMorePairs = true
  let i = currentPairCount + 1
  do {
    try {
      const pairData = await call({ target: factory, abi: 'get-pool-details-by-id', inputArgs: [{ type: 'number', value: i }] })
      if (!pairData.value?.factor) hasMorePairs = false
      else
        cache.pairData.push(pairData.value)
      i++
      await sleep(2100)
    } catch (e) {
      sdk.log('error fetching pair data', e)
      hasMorePairs = false
    }
  } while (hasMorePairs)
  let cacheNeedsUpdate = cache.pairData.length > currentPairCount
  const tokenSet = new Set(cache.pairData.flatMap(pair => [pair['token-x'], pair['token-y']]).map(token => token.value)
    .filter(token => !cache.tokenMetadata[token])
  )
  const tokensMissingMetadata = Array.from(tokenSet)
  if (tokensMissingMetadata.length > 0) {
    cacheNeedsUpdate = true
    for (const token of tokensMissingMetadata) {
      try {
        const decimals = await call({ target: token, abi: 'get-decimals' })
        const symbol = await call({ target: token, abi: 'get-symbol' })
        let baseToken = {}
        let baseDecimals = {}
        let baseSymbol = {}
        try {
          baseDecimals = await call({ target: token, abi: 'get-base-decimals' })
          baseToken = await call({ target: token, abi: 'get-base-token' })
          if (typeof baseToken === 'string') baseToken = { value: baseToken }
          if (baseToken.value) {
            baseSymbol = await call({ target: baseToken.value, abi: 'get-symbol' })
          }
        } catch (e) {
          // sdk.log('error fetching base token metadata', e)
        }
        cache.tokenMetadata[token] = { decimals: decimals.value, symbol: symbol.value, baseToken: baseToken.value, baseDecimals: baseDecimals.value, baseSymbol: baseSymbol.value }
        await sleep(2100)
      } catch (e) {
        sdk.log('error fetching token metadata', e)
      }
    }
  }

  api.log('pair count', cache.pairData.length)
  if (cacheNeedsUpdate)
    await setCache('alex/ammv2', 'stacks', cache)


  await sumTokens({ owner: 'SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.amm-vault-v2-01', balances: api.getBalances(), })


  // // add amm v2 tvl
  // for (const pair of cache.pairData) {
  //   const { value: bals } = await call({ target: factory, abi: 'get-balances', inputArgs: [pair['token-x'], pair['token-y'], pair.factor] })
  //   api.add(pair['token-x'].value, bals['balance-x'].value)
  //   api.add(pair['token-y'].value, bals['balance-y'].value)
  //   await sleep(600)
  // }
  return api.getBalances()
}

module.exports = {
  stacks: { tvl }
}