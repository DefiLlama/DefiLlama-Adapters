const { default: runInPromisePool } = require("@defillama/sdk/build/util/promisePool");
const { getConfig } = require("../helper/cache");
const { beacon } = require("../helper/chain/rpcProxy");
const { nullAddress } = require("../helper/tokenMapping");

module.exports = {
  ethereum: {
    tvl: async (api) => {
      const keys = []
      let lastId = 0
      const perPage = 1000

      while (true) {
        const { validators, pagination } = await getConfig(
          `ssv-network/${lastId}`,
          `https://api.ssv.network/api/v4/mainnet/validators?perPage=${perPage}&lastId=${lastId}`
        )

        // Process current page validators
        validators.forEach(v => {
          const normalizedKey = v.owner_address.toLowerCase()
          if (!keys.includes(normalizedKey)) keys.push(normalizedKey)
        })

        const itemsInPage = validators.length > 0
          ? pagination.current_last - pagination.current_first + 1
          : 0

        if (itemsInPage < perPage) {
          break
        }

        // Use current_last from pagination for next iteration
        lastId = pagination.current_last
      }

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