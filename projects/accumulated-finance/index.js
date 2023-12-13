const sdk = require('@defillama/sdk');
const config = require('./config.json');

const curvePoolAbi = require('./curvePoolAbi.json');

const { staking } = require('../helper/staking');
const { sumTokens2 } = require('../helper/unwrapLPs');

const chains = {
  ethereum: 1,
  arbitrum: 42161,
  velas: 106
};

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
  }
});

module.exports['ethereum'].staking = staking(
  '0x4424b4a37ba0088d8a718b8fc2ab7952c7e695f5',
  ['0xdf4ef6ee483953fe3b84abd08c6a060445c01170', '0x7AC168c81F4F3820Fa3F22603ce5864D6aB3C547'],
  'ethereum',
  '0xdf4ef6ee483953fe3b84abd08c6a060445c01170'
);