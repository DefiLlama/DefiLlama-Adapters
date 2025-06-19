const { sumTokensExport } = require("../helper/unwrapLPs");

const subVaultAddress = "0x1b745230a0320470a9af55BB0a67c47C90978A14";
const usdcAddress = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

module.exports = {
  methodology: "Calculates the TVL by summing the USDC balance held in the SubVault contract on Base.",
  base: {
    tvl: sumTokensExport({ owner: subVaultAddress, tokens: [usdcAddress], }),
  },
}