const sdk = require('@defillama/sdk')
const { default: runInPromisePool } = require("@defillama/sdk/build/util/promisePool");
const { getConfig } = require("../helper/cache");
const { beacon } = require("../helper/chain/rpcProxy");
const { nullAddress } = require("../helper/tokenMapping");
const { get } = require("../helper/http");

async function fetcher() {
  let hasMore = false
  let page = 0
  let lastId = 0
  const perPage = 1000
  let skippedValidatorCount = 0

  const keySet = new Set()
  do {
    const { validators, pagination } = await get(`https://api.ssv.network/api/v4/mainnet/validators?perPage=${perPage}&lastId=${lastId}`)
    // Process current page validators
    validators.forEach(v => {

      skippedValidatorCount++
      if (v.validator_info?.status === 'withdrawal_done') return;
      if (v.validator_info?.effective_balance === 0) return;
      skippedValidatorCount--

      const normalizedKey = v.owner_address.toLowerCase()
      if (!keySet.has(normalizedKey)) keySet.add(normalizedKey)
    })
    const itemsInPage = validators.length > 0
      ? pagination.current_last - pagination.current_first + 1
      : 0
    if (itemsInPage < perPage) {
      hasMore = false
    } else {
      hasMore = true
      lastId = pagination.current_last
    }

    console.log(`SSV Network: fetched page ${page + 1}, got ${validators.length} validators owners: total keys so far: ${keySet.size}, skipped validators: ${skippedValidatorCount}`)
    page++
  } while (hasMore)
  return Array.from(keySet)
}

module.exports = {
  timetravel: false,
  ethereum: {
    tvl: async (api) => {
      const cachedLog = await sdk.elastic.search({
        index: 'custom-scripts*',
        body: {
          query: {
            bool: {
              must: [
                { match: { project: 'ssv-network' } },
                { match: { chain: 'ethereum' } },
                { match: { 'metadata.type': 'tvl' } },
                {
                  range: {
                    timestamp: {
                      gte: Math.floor(Date.now() / 1000) - 24 * 60 * 60, // last 24 hours
                    },
                  },
                },
              ],
            },
          },
          sort: [{ timestamp: { order: 'desc' } }],
          size: 1,
        },
      })

      if (cachedLog?.hits?.hits?.length > 0) {
        const balances = cachedLog.hits.hits[0]._source.balances
        return balances
      }
      throw new Error("No recent cached TVL found, run the custom script to populate the cache")

      const keys = await getConfig(`ssv-network/validators`, undefined, { fetcher, })

      const queries = []
      for (let i = 0; i < keys.length; i += 30)
        queries.push(keys.slice(i, i + 30))

      await runInPromisePool({
        items: queries,
        concurrency: 3,
        processor: async (query) => {
          const balance = await beacon.balance(query)
          api.add(nullAddress, balance)
        }
      })
    },
  },
};