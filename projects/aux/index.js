const sdk = require('@defillama/sdk')
const { getResources, coreTokens } = require('../helper/aptos')
const { transformBalances } = require('../helper/portedTokens')

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  aptos: {
    tvl: async () => {
      const balances = {}
      return balances
    }
  }
}
