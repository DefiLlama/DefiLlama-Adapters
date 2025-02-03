const { sumTokensExport } = require("../helper/unknownTokens");

const escrowTvl = sumTokensExport({
  owner: '0x9039A2F174Ca7AfF96C983CAfB6EAC356a87edE7',
  tokens: ['0x3E96B0a25d51e3Cc89C557f152797c33B839968f', '0x6629Ce1Cf35Cc1329ebB4F63202F3f197b3F050B'],
})

module.exports = {
  sxr: {
    tvl: escrowTvl,
  }
};
