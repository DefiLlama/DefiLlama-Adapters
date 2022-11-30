const { graphQuery } = require('../helper/http')
const sdk = require('@defillama/sdk')

const endpoint = 'http://51.159.109.243:8079'

module.exports = {
  timetravel: false,
  solana: {
    tvl: async () => {
      const query = `
      {
        markets {
          baseVault
          quoteVault
          baseMint
          quoteMint
          stats {
            tvlBase
            tvlQuote
          }
        }
      }
      `

      const { markets } = await graphQuery(endpoint, query)
      const balances = {}
      markets.forEach(i => {
        sdk.util.sumSingleBalance(balances,i.baseMint,i.stats.tvlBase, 'solana')
        sdk.util.sumSingleBalance(balances,i.quoteMint,i.stats.tvlQuote, 'solana')
      })
      return balances
    }
  }
}