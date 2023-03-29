const { sumTokensExport, nullAddress } = require('../helper/sumTokens')

module.exports = {
  tezos: {
    tvl: sumTokensExport({ owner: 'KT1TxqZ8QtKvLu3V3JH7Gx58n7Co8pgtpQU5', tokens: [nullAddress, 'KT1PWx2mnDueood7fEmfbBDKx1D9BAnnXitn'] }),
  },
  methodology: "Liquidity on tezos' tzBTC-XTZ pair"
}