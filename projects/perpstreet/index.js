const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokensExport } = require("../helper/unwrapLPs");
module.exports = {
  hemi: {
    tvl: sumTokensExport({
      owner: '0x3E0341e2618F39BDd78E769F80BB893a3823cc4A',
      tokens: [ADDRESSES.hemi.USDC_e,ADDRESSES.hemi.USDT ],
    }),
  }
};
