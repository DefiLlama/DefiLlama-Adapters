const { sumTokensExport } = require("../helper/unwrapLPs");

const config = {
  ethereum: { DSU: '0x605D26FBd5be761089281d5cec2Ce86eeA667109', collateral: '0x2d264EBDb6632A06A1726193D4d37FeF1E5dbDcd', },
}

module.exports = {};

Object.keys(config).forEach(chain => {
  const { DSU, collateral} = config[chain]
  module.exports[chain] = {
    tvl: sumTokensExport({ owner: collateral, tokens: [DSU] })
  }
})
