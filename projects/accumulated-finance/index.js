const sdk = require('@defillama/sdk');
const config = require('./config.json');

async function getLsdPoolsTvl(api, filteredPools) {

  // baseToken - a token staked into Accumulated Finance liquid staking
  // stToken - a liquid staking token
  const calls = filteredPools.map(pool => ({ target: pool.stToken }));

  // calculate total supply of existing LST tokens
  const balanceOfResults = await sdk.api.abi.multiCall({
    abi: 'erc20:totalSupply',
    chain: api.chain,
    calls
  });

  const balances = {};
  balanceOfResults.output.forEach(balanceOf => {
    const pool = filteredPools.find(item => item.stToken === balanceOf.input.target);
    if (pool) {
      balances[pool.baseToken] = balanceOf.output;
    }
  });
  return balances;
}

const chains = config.chains;

module.exports = {
  timetravel: false,
  methodology:
    "We aggregated liquid staking tokens issued by Accumulated Finance",
}

Object.keys(config.chains).forEach(chain => {
  module.exports[chain] = {
    tvl: async (timestamp, block, chainBlocks, { api }) => {
      const chainId = chains[api.chain];
      const filteredPools = config.lsdPools.filter(item => item.chainID === chainId);
      return await getLsdPoolsTvl(api, filteredPools);
    }
  }
});