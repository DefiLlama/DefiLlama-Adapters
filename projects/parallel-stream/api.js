const { getAPI, getTokenPrices, } = require('../helper/acala/api')
const sdk = require('@defillama/sdk')

module.exports = {
  misrepresentedTokens: true,
  parallel: {
    tvl: async () => {
      const chain = 'parallel'
      const api = await getAPI(chain)
      return getStreamData(api, chain)
    }
  },
  heiko: {
    tvl: async () => {
      const chain = 'heiko'
      const api = await getAPI(chain)
      return getStreamData(api, chain)
    }
  },
};

const blacklisted = [0, 1]

async function getStreamData(api, chain) {
  const streams = await api.query.streaming.streams.entries()
  const balances = {}
  streams.map(i => i[1].toJSON()).forEach(stream => sdk.util.sumSingleBalance(balances, stream.assetId, +stream.remainingBalance))
  const { updateBalances } = await getTokenPrices({ api, chain })
  blacklisted.forEach(token => delete balances[token])
  updateBalances(balances)
  return balances
}
