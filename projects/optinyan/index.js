const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')

module.exports = {
  optimism: {
    tvl: sumTokensExport({ owner: '0x6F7Fe8b33358a3F4313421186b98CA78127C6DB6', tokens: [nullAddress] }),
  }
}
