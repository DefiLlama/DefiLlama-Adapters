const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');

module.exports = {
  monad: {
    tvl: sumTokensExport({ owners: [
      '0x33Fa76352f1cDCaf030bD663b6582CF8167A4893'
    ], tokens: [ADDRESSES.monad.USDC]})
  },
  methodology: `TVL is the total quantity of USDC held in the kizzy USDC vault.`
}
