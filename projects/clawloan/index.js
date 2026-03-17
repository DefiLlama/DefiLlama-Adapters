const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

// Clawloan - The Credit Layer for AI Agents
// Micro-loans for AI bots on Base, Arbitrum, and Optimism
// https://clawloan.com

// Contract addresses by chain
const CONTRACTS = {
  base: {
    lendingPool: "0x3Dca46B18D3a49f36311fb7A9b444B6041241906",
    usdc: ADDRESSES.base.USDC,
  },
  arbitrum: {
    lendingPool: "0x8a184719997F77Ac315e08dCeDE74E3a9C19bd09",
    usdc: ADDRESSES.arbitrum.USDC_CIRCLE,
  },
  optimism: {
    lendingPool: "0x8a184719997F77Ac315e08dCeDE74E3a9C19bd09",
    usdc: ADDRESSES.optimism.USDC_CIRCLE,
  },
};

module.exports = {
  methodology: "TVL is calculated as the total USDC deposited in LendingPoolV2 contracts across all chains. Clawloan provides uncollateralized micro-loans ($0.50-$100) to verified AI agents for operational costs like gas, API calls, and compute.",
  base: {
    tvl: sumTokensExport({
      owner: CONTRACTS.base.lendingPool,
      tokens: [CONTRACTS.base.usdc],
    }),
  },
  arbitrum: {
    tvl: sumTokensExport({
      owner: CONTRACTS.arbitrum.lendingPool,
      tokens: [CONTRACTS.arbitrum.usdc],
    }),
  },
  optimism: {
    tvl: sumTokensExport({
      owner: CONTRACTS.optimism.lendingPool,
      tokens: [CONTRACTS.optimism.usdc],
    }),
  },
};
