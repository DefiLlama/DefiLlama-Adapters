const { sumTokensExport, nullAddress } = require("../helper/sumTokens");

module.exports = {
  bsquared: { tvl: sumTokensExport({ owner: '0xd5B5f1CA0fa5636ac54b0a0007BA374A1513346e', tokens: [nullAddress] }) },
}