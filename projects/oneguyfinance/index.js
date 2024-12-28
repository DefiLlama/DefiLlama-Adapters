const { sumTokensExport, nullAddress } = require("../helper/unwrapLPs");

const config = {
  polygon: { owners: ['0x4e9f8e71DBbd9aCca9b4c7ae1c647FC1B45065FD'], tokens: [nullAddress] }
}

module.exports = {
  methodology: `TVL is the total amount of MATIC held on smart-contracts.`,
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl: sumTokensExport(config[chain]) }
})