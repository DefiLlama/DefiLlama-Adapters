const sdk = require('@defillama/sdk');
const config = require('./config.json');

const chains = {
  ethereum: 1,
  arbitrum: 42161,
  velas: 106
};

async function getLsdPoolsTvl(api, filteredPools) {
  const calls = filteredPools.map(pool => ({
    target: pool.stAddress
  }));

  const balanceOfResults = await sdk.api.abi.multiCall({
    abi: 'erc20:totalSupply',
    chain: api.chain,
    calls
  });

  const balances = {};
  balanceOfResults.output.forEach(balanceOf => {
    const pool = filteredPools.find(item => item.stAddress === balanceOf.input.target);
    if (pool) {
      balances[pool.baseToken] = balanceOf.output;
    }
  });

  return balances;
}

Object.keys(chains).forEach(chain => {
  module.exports[chain] = {
    tvl: async (timestamp, block, chainBlocks, { api }) => {
      const chainId = chains[api.chain];
      const filteredPools = config.lsdPools.filter(item => item.chainID === chainId);
      return await getLsdPoolsTvl(api, filteredPools);
    }
  };
});