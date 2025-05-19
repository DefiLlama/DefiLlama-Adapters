const { getLogs } = require("../helper/cache/getLogs");
const abi = require("../helper/abis/morpho.json");
const { sumTokens2 } = require("../helper/unwrapLPs");
const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are depoisted in all vaults curated by Clearstar.',
  blockchains: {
    base: {
      morpho: [
        '0x1D3b1Cd0a0f242d598834b3F2d126dC6bd774657',
      ],
    },
  }
}

module.exports = getCuratorExport(configs)
