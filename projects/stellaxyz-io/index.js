const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs, getAddress } = require('../helper/cache/getLogs');
const { cachedGraphQuery } = require('../helper/cache')
const { graphQuery } = require('../helper/http');
const ADDRESSES = require('../helper/coreAssets.json')

const config = {
  arbitrum: {
    endpoint: 'https://graph.stellaxyz.io/v1/graphql',
    // factory: '0x573a89fBc6b4a5B11a55DC9814A1018a3A9cD0CA',
    // fromBlock: 101291920,
  }
}

module.exports = {
  misrepresentedTokens: true,
}

const query = `query GET_ALL_LENDING_POOLS{  pools: lending_pool_registry(    where: {_or: [{is_launched: {_eq: true}}], chain_id: {_eq: 42161}, is_deprecated: {_eq: false}}  ) {    tokenName: lending_token_name      poolAddress: pool_address     }}`
const strategyQuery = `query Strategy {  strategy(    where: {chain_id: {_eq: 42161 }, _or: [{is_launched: {_eq: true}}]}   order_by: {display_priority: asc}  ) {    id    name    strategyAddress: strategy_address  }}`

Object.keys(config).forEach(chain => {
  const { endpoint, factory, fromBlock, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      await getStraegyTvl2()
      const { pools } = await cachedGraphQuery('stellaxyz/lending-pool/' + api.chain, endpoint, query)
      const lendingContracts = pools.map(i => i.poolAddress)
      const tokens = await api.multiCall({ abi: 'address:depositToken', calls: lendingContracts })
      await sumTokens2({ api, tokensAndOwners2: [tokens, lendingContracts] })

      async function getStraegyTvl2() {
        let hasMore = false
        let offset = 0
        do {
          const { position } = await graphQuery(endpoint, `query GetPositionsDefillama($offset:Int!) {
            position(order_by:{opened_at:asc},where: {status: {_eq: "Active"}}, limit: 1000, offset: $offset) {
            id
              position_value_usd
              strategy{
                id
                strategy_address
                lp_address
                pool_address
              }
              opened_at
              closed_at
              status
            }
          }`, {offset})
          hasMore = position.length === 1000
          position.forEach(i => {
            api.add(ADDRESSES.arbitrum.USDC, i.position_value_usd * 1e6)
          })
        } while (hasMore)
      }

      async function getStategyTvl() {
        const { strategy } = await cachedGraphQuery('stellaxyz/strategy/' + api.chain, endpoint, strategyQuery)
        const strategies = strategy.map(i => i.strategyAddress)
        // const logs = await getLogs({        api,        target: factory,        topics: ['0x0803371633b57311f58d10924711080d2dae75ab17c5c0c262af3887cfca00bb'],        fromBlock,      })

        const positionManagers = await api.multiCall({ abi: 'address:positionManager', calls: strategies })
        return sumTokens2({ api, owners: positionManagers, resolveUniV3: true, })


      }
    }
  }
})