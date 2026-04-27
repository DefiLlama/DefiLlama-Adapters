const { getConfig } = require('../helper/cache')

const chains = ['ethereum', 'base', 'arbitrum',]

chains.forEach(chain => {

  module.exports[chain] = {
    tvl: async (api) => {
      const config = await getConfig('wedefin/config', 'https://app.wedefin.com/users_portfolios.json')
      const appConfig = config[api.chain]
      const tokensAndOwners = []
      Object.values(appConfig).forEach(portfolio => {

        if (Array.isArray(portfolio?.index_portfolio?.tokens)) {
          const owner = portfolio?.index_portfolio?.address

          if (owner)
            portfolio.index_portfolio.tokens.forEach(token => {
              tokensAndOwners.push([token.address, owner])
            })
        }

        if (Array.isArray(portfolio?.pro_portfolio?.tokens)) {
          const owner = portfolio?.pro_portfolio?.address

          if (owner)
            portfolio.pro_portfolio.tokens.forEach(token => {
              tokensAndOwners.push([token.address, owner])
            })
        }

      })

      return api.sumTokens({ tokensAndOwners })
    }
  }
})