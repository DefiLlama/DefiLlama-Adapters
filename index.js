const { getUniqueAddresses } = require('../helper/utils');

module.exports = {
  methodology:
    "LinkDeFi is a non-custodial DeFi router and strategy aggregator that automatically routes user deposits to verified external protocols such as Colend, B14G, and Morpho. It does not custody user assets directly, so its TVL is 0. LinkDeFi currently supports Ethereum, BSC, CoreDAO, Avalanche, and Aptos networks.",
  misrepresentedTokens: false,
  hallmarks: [
    [Date.parse("2024-12-01") / 1000, "Aggregator Launch"],
  ],
  start: 1733000000, // example timestamp
  ethereum: {
    tvl: async () => 0,
  },
  bsc: {
    tvl: async () => 0,
  },
  core: {
    tvl: async () => 0,
  },
  avax: {
    tvl: async () => 0,
  },
  aptos: {
    tvl: async () => 0,
  },
};
