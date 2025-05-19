const { getLogs } = require("../helper/cache/getLogs");
const abi = require("../helper/abis/morpho.json");
const { sumTokens2 } = require("../helper/unwrapLPs");
const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are depoisted in all vaults curated by M11C.',
  blockchains: {
    ethereum: {
      morpho: [
        '0x2C3Cc1C02856894345797Cf6ee76aE76AC0f4031',
      ],
    },
  }
}

module.exports = getCuratorExport(configs)
