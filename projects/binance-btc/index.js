const sdk = require('@defillama/sdk');
const { sumTokensExport } = require('../helper/sumTokens');

const owners = [
'3LYJfcfHPXYJreMsASk2jkn69LWEYKzexb'
]

module.exports = {
  methodology: "BTC on btc chain",
  bitcoin: {
    tvl: sdk.util.sumChainTvls([
      sumTokensExport({ owners }),
    ]),
  },
};