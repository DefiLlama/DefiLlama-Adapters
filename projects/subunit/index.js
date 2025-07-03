const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const subVaultAddress = "0x1b745230a0320470a9af55BB0a67c47C90978A14";
const usdcAddress = ADDRESSES.base.USDC;

module.exports = {
  methodology: "Calculates the TVL by summing the USDC balance held in the SubVault contract on Base.",
  base: {
    tvl: sumTokensExport({ owner: subVaultAddress, tokens: [usdcAddress], }),
  },
}