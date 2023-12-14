const sdk = require('@defillama/sdk');
const config = require('./config.json');

async function getLsdPoolsTvl(api, filteredPools) {

  const calls = filteredPools.map(pool => ({ target: pool.stToken }));

  const balanceOfResults = await sdk.api.abi.multiCall({
    abi: 'erc20:totalSupply',
    chain: api.chain,
    calls
  });

  const balances = {};
  balanceOfResults.output.forEach(balanceOf => {
    const pool = filteredPools.find(item => item.stToken === balanceOf.input.target);
    if (pool) {
      // baseToken - wrapped token that can be received from coingecko.
      // stToken - staked token. The price of stToken is equal the price of baseToken
      balances[pool.baseToken] = balanceOf.output;
    }
  });
  return balances;
}

const chains = config.chains;

Object.keys(config.chains).forEach(chain => {
  module.exports[chain] = {
     tvl: async (timestamp, block, chainBlocks, { api }) => {
       const chainId = chains[api.chain];
       const filteredPools = config.lsdPools.filter(item => item.chainID === chainId);
       return await getLsdPoolsTvl(api, filteredPools);
     }
  }
});
