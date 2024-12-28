const ADDRESSES = require('./helper/coreAssets.json')
const { sumTokensExport } = require('./helper/unwrapLPs');

module.exports = {
  theta: {
    tvl: sumTokensExport({ owner: ADDRESSES.theta.WTFUEL, token: ADDRESSES.null}),
  },
}