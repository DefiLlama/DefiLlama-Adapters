const { default: runInPromisePool } = require("@defillama/sdk/build/util/promisePool");
const { getConfig } = require("../helper/cache");
const { beacon } = require("../helper/chain/rpcProxy");
const { nullAddress } = require("../helper/tokenMapping");

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(cacheKey, url, maxRetries = 3, initialDelayMs = 1000) {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await getConfig(cacheKey, url);
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        const delay = initialDelayMs * Math.pow(2, attempt - 1); // Exponential backoff: 1s, 2s, 4s
        console.log(`SSV API request failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }
  throw new Error(`SSV API request failed after ${maxRetries} attempts: ${lastError?.message || lastError}`);
}

module.exports = {
  ethereum: {
    tvl: async (api) => {
      const keys = []
      let lastId = 0
      const perPage = 1000

      while (true) {
        const { validators, pagination } = await fetchWithRetry(
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

      console.log(keys.length)

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
