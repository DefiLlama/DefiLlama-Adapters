const { getChainTransform } = require('../helper/portedTokens.js');
const { unwrapYearn, sumTokensSharedOwners } = require('../helper/unwrapLPs');
const { staking } = require("../helper/staking.js");
const contracts = require('./contracts');

function tvl(chain) {
  return async (timestamp, block, chainBlocks) => {
    const balances = {};
    const transform = await getChainTransform(chain);

    await sumTokensSharedOwners(
      balances, 
      Object.values(contracts[chain].underlyingTokens)
        .concat(Object.values(contracts[chain].yvTokens)), 
        Object.values(contracts[chain].tokenHolders), 
        chainBlocks[chain],
        chain, 
        transform
      );

    for (const yvToken of Object.values(contracts[chain].yvTokens)) {
      await unwrapYearn(balances, yvToken, chainBlocks[chain], chain, transform);
    };

    return balances;
  };
};

module.exports = {
  ethereum: {
    tvl: tvl('ethereum'),
    staking: staking(contracts.ethereum.staking.holder, contracts.ethereum.staking.token)
  },
  fantom: {
    tvl: tvl('fantom')
  }
};