const { getLogs } = require("../helper/cache/getLogs");
const abi = require("../helper/abis/morpho.json");
const { sumTokens2 } = require("../helper/unwrapLPs");
const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are depoisted in all vaults curated by Hakutora.',
  blockchains: {
    ethereum: {
      morpho: [
        '0x974c8FBf4fd795F66B85B73ebC988A51F1A040a9',
      ],
    },
  }
}

module.exports = getCuratorExport(configs)
