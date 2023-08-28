const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs, getAddress } = require('../helper/cache/getLogs');
const { cachedGraphQuery } = require('../helper/cache')

const config = {
  arbitrum: {
    endpoint: 'https://graph.stellaxyz.io/v1/graphql',
    // factory: '0x573a89fBc6b4a5B11a55DC9814A1018a3A9cD0CA',
    // fromBlock: 101291920,
  }
}

const query = `query GET_ALL_LENDING_POOLS{  pools: lending_pool_registry(    where: {_or: [{is_launched: {_eq: true}}], chain_id: {_eq: 42161}, is_deprecated: {_eq: false}}  ) {    tokenName: lending_token_name      poolAddress: pool_address     }}`
const strategyQuery = `query Strategy {  strategy(    where: {chain_id: {_eq: 42161 }, _or: [{is_launched: {_eq: true}}]}   order_by: {display_priority: asc}  ) {    id    name    strategyAddress: strategy_address  }}`

Object.keys(config).forEach(chain => {
  const { endpoint, factory, fromBlock, } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const { pools } = await cachedGraphQuery('stellaxyz/lending-pool/'+api.chain, endpoint, query)
      const { strategy } = await cachedGraphQuery('stellaxyz/strategy/'+api.chain, endpoint, strategyQuery)
      const lendingContracts = pools.map(i => i.poolAddress)
      const strategies = strategy.map(i => i.strategyAddress)
      // const logs = await getLogs({        api,        target: factory,        topics: ['0x0803371633b57311f58d10924711080d2dae75ab17c5c0c262af3887cfca00bb'],        fromBlock,      })

      const positionManagers = await api.multiCall({ abi: 'address:positionManager', calls: strategies })

      const tokens = await api.multiCall({ abi: 'address:depositToken', calls: lendingContracts })
      await sumTokens2({ api, tokensAndOwners2: [tokens, lendingContracts] })
      return sumTokens2({ api, owners: positionManagers, resolveUniV3: true, })
    }
  }
})