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

    for (const [name, yvToken] of Object.entries(contracts[chain].yvTokens)) {
      if(chain === "optimism"){
          const underlying = "optimism:"+contracts[chain].underlyingTokens[name.substring(1)]
          const yvTokenFinal = transform(yvToken)
          balances[underlying] = balances[yvTokenFinal]
          delete balances[yvTokenFinal]
      } else {
        await unwrapYearn(balances, yvToken, chainBlocks[chain], chain, transform);
      }
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
  },
  optimism: {
    tvl: tvl('optimism')
  }
};