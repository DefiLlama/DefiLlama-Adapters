const contracts = require("./contracts.json");
const { sumTokens2 } = require("../helper/unwrapLPs");
const { Contract } = require('ethers');
const { providers } = require('@defillama/sdk/build/general');

const infoAggregatorABI = ['function getSavvyPositionManagers() external view returns (address[] memory)']
const savvyPositionManagerABI = ['function _yieldStrategyManager() external view returns (address)']
const savvyYieldStrategyManagerABI =
  [
    'function getSupportedBaseTokens() external view returns (address[] memory)',
    'function getSupportedYieldTokens() external view returns (address[] memory) '
  ]

function tvl(chain) {
  return async (timestamp, block, chainBlocks, { api }) => {
    let baseTokens = [], yieldTokens = [];
    let tokenHolders = []
    const infoAggregator = new Contract(contracts.infoAggregator, infoAggregatorABI, providers.arbitrum);
    const savvyPositionManagers = await infoAggregator.getSavvyPositionManagers();
    for (let i = 0; i < savvyPositionManagers.length; i++) {
      const savvyPositionManagerContract = new Contract(savvyPositionManagers[i], savvyPositionManagerABI, providers.arbitrum);
      const yieldStrategyManager = await savvyPositionManagerContract._yieldStrategyManager();
      const yieldStrategyManagerContract = new Contract(yieldStrategyManager, savvyYieldStrategyManagerABI, providers.arbitrum);
      const _baseTokens = await yieldStrategyManagerContract.getSupportedBaseTokens();
      const _yieldTokens = await yieldStrategyManagerContract.getSupportedYieldTokens();

      if (!tokenHolders.includes(yieldStrategyManager))
        tokenHolders.push(yieldStrategyManager)
      if (!tokenHolders.includes(savvyPositionManagers[i]))
        tokenHolders.push(savvyPositionManagers[i])
      _baseTokens.forEach(token => {
        if (!baseTokens.includes(token))
          baseTokens.push(token)
      })
      _yieldTokens.forEach(token => {
        if (!yieldTokens.includes(token))
          yieldTokens.push(token)
      })
    }
    const additionalTokens = Object.values(contracts.additionalTokens);

    const tokens = baseTokens.concat(yieldTokens)
      .concat(["0x625E7708f30cA75bfd92586e17077590C60eb4cD", "0xe50fA9b3c56FfB159cB0FCA61F5c9D750e8128c8"]);

    additionalTokens.forEach(token => {
      if (!tokens.includes(token))
        tokens.push(token)
    })
    await sumTokens2({ tokens, api, owners: Object.values(contracts.tokenHolders) })
  };
}

module.exports = {
  methodology: 'The calculated TVL is the current sum of all base tokens and yield tokens in our contracts.',
  arbitrum: {
    tvl: tvl("arbitrum")
  },
  hallmarks: [
    [1691473498, "LBP Launch"]
  ]
}