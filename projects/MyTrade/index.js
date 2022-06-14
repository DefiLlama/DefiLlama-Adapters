const { getUniTVL } = require("../helper/unknownTokens")
const { sumTokens2 } = require("../helper/unwrapLPs")
const { getUniqueAddresses } = require("../helper/utils")
const sdk = require('@defillama/sdk')

const orderBook = '0x5D36b36c53438C0fb70DCA5082EE5BDe25Bd888B'

module.exports = {
  polygon: {
    tvl: async (_, _b, { polygon: block }) => {
      const {
        pairs,
        updateBalances,
        balances,
      } = await getUniTVL({
        factory: '0x3ee4154c7f42d94e1092ad8ce5debb4b743ed0b2',
        chain: 'polygon',
        coreAssets: [
          '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270', // wmatic
          '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', // usdc
          '0x4535e52cdf3ab787b379b7b72b5990767e6747e4', // myt
        ],
        withMetaData: true,
      })(_, _b, { polygon: block })

      const tokens = Object.values(pairs).map(i => Object.values(i)).flat()

      await sumTokens2({
        chain: 'polygon', block, owner: orderBook, tokens: getUniqueAddresses(tokens), balances,
      })

      await updateBalances(balances)
      return balances
    }
  },
}
