const { sumTokens2 } = require('../helper/unwrapLPs');
const { getCuratorTvl } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are deposited in all vaults curated by the IMF.',
  blockchains: {
    ethereum: {
      morphoVaultOwners: [
        '0x6b22171a3eB9CF39C0f3e56C4713F2E30e1Ba262',
      ],
    },
  }
}

module.exports = {
  doublecounted: true,
  methodology: configs.methodology,
  ethereum: {
    tvl: async (api) => {
      

      // v2 - vault on Morpho Blue
      await getCuratorTvl(api, configs.blockchains.ethereum)
    }
  }
}