const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')
const owners = [
  "0xe9fB8C70aF1b99F2Baaa07Aa926FCf3d237348DD", // vault manager
  "0x83084cb182162473d6feffcd3aa48ba55a7b66f7", // senior tranche
  "0x944766f715b51967e56afde5f0aa76ceacc9e7f9", // junior tranche
]

module.exports = {
  methodology: 'counts the number of USDC tokens in the Avantis contract.',
  base: {
    tvl: sumTokensExport({ owners, tokens: [ADDRESSES.base.USDC] })
  }
}; 