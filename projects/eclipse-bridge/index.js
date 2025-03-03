const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs");
const { getTokenTotalSupply } = require("../helper/solana");
const sdk = require('@defillama/sdk')

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owner: '0xd7e4b67e735733ac98a88f13d087d8aac670e644', // treasury for eclipse canonical bridge
        fetchCoValentTokens: true,
        permitFailure: true
      }),
  },
  eclipse: {
    tvl: async (api) => {
      const balances = {}

      for (const [symbol, mint] of Object.entries(ADDRESSES.eclipse)) {
        const totalSupply = await getTokenTotalSupply(mint, 'eclipse', mint !== ADDRESSES.eclipse.ETH)
        sdk.util.sumSingleBalance(balances, mint, totalSupply, 'eclipse')
      }

      return balances
    }
  },
}; 