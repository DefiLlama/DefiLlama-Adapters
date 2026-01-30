const { sumTokensExport } = require('../helper/sumTokens')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  methodology: 'TVL is the USDT balance held in the VerifiableTransfer contract (prepaid fees and collected fees).',
  tron: {
    tvl: sumTokensExport({
      owner: 'TWy8Zvzfj6Tpe7g85Re8pczxxDfaFXEDVc',
      tokens: [ADDRESSES.tron.USDT],
    }),
  },
}
