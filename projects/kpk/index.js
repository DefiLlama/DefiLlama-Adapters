const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets deposited in the vaults curated by kpk.',
  blockchains: {
    ethereum: {
      erc4626: [
        '0x9396dcbf78fc526bb003665337c5e73b699571ef',
        '0xA9d17f6D3285208280a1Fd9B94479c62e0AABa64'
      ],
    },
  }
}

module.exports = getCuratorExport(configs)
