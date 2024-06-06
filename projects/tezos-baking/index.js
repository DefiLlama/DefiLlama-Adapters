const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, nullAddress } = require('../helper/sumTokens')

module.exports = {
  tezos: {
    tvl: sumTokensExport({ owner: 'KT1TxqZ8QtKvLu3V3JH7Gx58n7Co8pgtpQU5', tokens: [nullAddress, ADDRESSES.tezos.tzBTC] }),
  },
  methodology: "Liquidity on tezos' tzBTC-XTZ pair"
}