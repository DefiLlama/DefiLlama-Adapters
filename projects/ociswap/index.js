const { sumTokens, queryAddresses } = require('../helper/chain/radixdlt');
const { getConfig } = require('../helper/cache')
const { get } = require('../helper/http')
const sdk = require('@defillama/sdk')

module.exports = {
  radixdlt: {
    tvl: async (api) => {
      const pools = await getConfig('ociswap', null, {
        fetcher: async () => {
          let items = []
          let cursor = 0
          do {
            const { data, next_cursor } = await get(`https://api.ociswap.com/pools?cursor=${cursor}&limit=100`)
            items.push(...data)
            sdk.log(`Fetched ${items.length} pools`, data.length, next_cursor)
            cursor = next_cursor

          } while (items.length % 100 === 0 && cursor !== 0)
          return items
        }
      })
      const data = await queryAddresses({ addresses: pools.map(i => i.address) })
      const owners = data.map(i => i.metadata.items.find(i => i.key === 'liquidity_pool')?.value?.typed?.value).filter(i => i)
      return sumTokens({ owners, api, })
    },
  },
  timetravel: false
}
