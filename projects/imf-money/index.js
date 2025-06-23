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
      // v1
      await sumTokens2({api, owner: '0x30F75834cB406b7093208Fda7F689938aCBD1EeB', tokens: [
        '0x6982508145454Ce325dDbE47a25d4ec3d2311933',
        '0x698b1d54e936b9f772b8f58447194bbc82ec1933',
        '0xaaee1a9723aadb7afa2810263653a34ba2c21c7a',
        '0x699ec925118567b6475fe495327ba0a778234aaa',
        '0x960fCE8724aA127184B6d13Af41a711755236c77',
      ]});

      // v2 - vault on Morpho Blue
      await getCuratorTvl(api, configs.blockchains.ethereum)
    }
  }
}
