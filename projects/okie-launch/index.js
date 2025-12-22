const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')

module.exports = {
  xlayer: {
    tvl: sumTokensExport({  owner: '0xeb554444b5c49bab7781b1cfc0e3be211053c6d7', token: nullAddress })
  },
};
