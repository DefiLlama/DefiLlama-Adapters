const { sumTokensExport, nullAddress } = require("../helper/unwrapLPs");

const ADMIN_ADDRESSES = {
  ethereum: "0x233dc79F924c35AcB4524BaC4A883c8CE11A75B2",
  base: "0x233dc79F924c35AcB4524BaC4A883c8CE11A75B2",
  optimism: "0x233dc79F924c35AcB4524BaC4A883c8CE11A75B2",
  linea: "0x233dc79F924c35AcB4524BaC4A883c8CE11A75B2",
}

module.exports = {
  methodology:
    "Adds up the total value locked as collateral on the Bridge platform"
}

Object.keys(ADMIN_ADDRESSES).forEach(chain => {
  module.exports[chain] = {
    tvl: sumTokensExport({ owner: ADMIN_ADDRESSES[chain], tokens: [nullAddress], logCalls: true })
  }
})
