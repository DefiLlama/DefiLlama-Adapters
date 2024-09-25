const { sumTokens2 } = require('../helper/unwrapLPs')

async function tvl(api) {
  const vault = '0x551d155760ae96050439ad24ae98a96c765d761b'
  const tokens = await api.call({ abi: 'address[]:getAllowableAssets', target: vault })
  await api.sumTokens({ owner: vault, tokens })

  const storage = await api.call({ abi: 'address:strategyStorage', target: vault })
  const strategies = await api.fetchList({ lengthAbi: 'getStrategyCount', itemAbi: 'getStrategyAddress', target: storage })
  return sumTokens2({
    api, owners: strategies, fetchCoValentTokens: true, resolveUniV3: true, tokenConfig: {
      onlyWhitelisted: false,
    }
  })
}

module.exports = {
  methodology: 'Token balance in vault and strategy contracts',
  start: 1725926400, // Tuesday, September 10, 2024 12:00:00 AM
  ethereum: {
    tvl,
  }
}