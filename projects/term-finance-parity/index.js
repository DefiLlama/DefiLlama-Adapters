const { getCuratorExport } = require("../helper/curators")

// Term Finance's Morpho vault owner (Parity vaults: pcUSDC, pcETH, pcHYUSDC)
const PARITY_OWNER = '0xbfFcAdCd5549cC378693108BcD4435776A6fa795'

const configs = {
  methodology: 'Counts all assets deposited in the Parity vaults on Morpho, curated by Term Finance.',
  start: '2026-04-23',
  blockchains: {
    ethereum: {
      morphoVaultOwners: [PARITY_OWNER],
    },
    arbitrum: {
      morphoVaultOwners: [PARITY_OWNER],
    },
  },
}

module.exports = getCuratorExport(configs)
