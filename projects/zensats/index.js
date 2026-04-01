// DefiLlama TVL Adapter for ZenSats
// https://zensats.app

const config = {
  ethereum: {
    vaults: [
      "0x617A6877f0a55D1eF2B64b5861A2bB5Fe6FEB739", // ZenSats WBTC vault
      "0xbaEc8343B610A5ee7Ca2c5b93507AC7def98E2B1", // ZenETH wstETH vault
      "0x7d5281D590Fb0647aDc7d8494a2c8Fb8C2B23cBD", // ZenGold XAUT vault
    ],
  },
};

module.exports.methodology =
  "TVL is the total value of collateral assets deposited in ZenSats ERC4626 vaults.";

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    tvl: async (api) => {
      return api.erc4626Sum2({ calls: config[chain].vaults });
    },
  };
});
