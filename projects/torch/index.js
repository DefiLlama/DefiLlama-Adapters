const ADDRESSES = require("../helper/coreAssets.json")
const { sumTokensExport } = require('../helper/chain/ton')

ROUTER = 'EQCaEOMOR2SRcXTVSolw--rY62ghCoCRjn4Is3bBdnqYwIVZ'

module.exports = {
  timetravel: false,
  ton: {
    tvl: sumTokensExport({
      owners: [ROUTER],
      tokens: ADDRESSES.ton.TON,
    })
  },
}