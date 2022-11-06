const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')
const tokens = [nullAddress]

const config = {
  bsc: {
    owners: Object.values({
      predictionBNB: "0x31B8A8Ee92961524fD7839DC438fd631D34b49C6",
      predictionETH: "0xE39A6a119E154252214B369283298CDF5396026B",
      predictionBTC: "0x3Df33217F0f82c99fF3ff448512F22cEf39CC208",
    }),
  },
  polygon: {
    owners: Object.values({
      predictionBTCPOLY: "0xd71b0366CD2f2E90dd1F80A1F0EA540F73Ac0EF6",
      predictionTESLA: "0x3fc376530Ac35d37Dd1Fa794F922e0f30CbB2c46",
      predictionMATIC: "0x59e0aD27d0F58A15128051cAA1D2917aA71AB864",
    }),
  },
}

module.exports = {};

Object.keys(config).forEach(chain => {
  const { owners } = config[chain]
  module.exports[chain] = {
    tvl: sumTokensExport({ chain, owners, tokens, })
  }
})
