const utils = require('../helper/utils.js');
const CHAIN_CONFIG = require('./chainConfig')

async function chainTVL(api, chainConfig) {
  const { chainId, conditionalTokensContract } = chainConfig;

  // get chain collaterals
  const response = await utils.fetchURL(`https://api.olab.xyz/api/v2/currency/collateral?chainId=${chainId}`);
  const collaterals = response.data.result;

  for (const collateral of collaterals) {
    const collateralBalance = await api.call({
      abi: 'erc20:balanceOf',
      target: collateral.Contract,
      params: [conditionalTokensContract],
    });

    api.add(collateral.Contract, collateralBalance)
  }
}

// Create module for each chain
const createChainModule = (chain) => {
  const config = CHAIN_CONFIG[chain]
  const module = {
    tvl: (api) => chainTVL(api, config)
  }

  return module
}

// Export configuration for each chain
module.exports = {
  methodology: 'TVL (Total Value Locked) refers to the total value of all collateral tokens held in the Conditional Token smart contract, including all collateral tokens provided to O.LAB Prediction markets across different chains.',
  start: 23899060,
  base: createChainModule('base'),
};