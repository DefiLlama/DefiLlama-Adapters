const sdk = require('@defillama/sdk')

module.exports = {
  timetravel: false,
  solana: {
    tvl: async () => {
      const cachedLog = await sdk.elastic.search({
        index: 'custom-scripts*',
        body: {
          query: {
            bool: {
              must: [
                { match: { project: 'metadao/futarchy-dao-treasuries' } },
                { match: { chain: 'solana' } },
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
    },
  },
};