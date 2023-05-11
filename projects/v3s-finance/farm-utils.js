const sdk = require('@defillama/sdk');
const BigNumber = require('bignumber.js');
const farmCronos = require('./farm-cronos.json');

const farmLPBalance = async (
  chain,
  block,
  masterChef,
  lpToken,
  token0,
  token1,
) => {
  const balances = (
    await sdk.api.abi.multiCall({
      abi: 'erc20:balanceOf',
      calls: [
        {
          target: token0,
          params: [lpToken],
        },
        {
          target: token1,
          params: [lpToken],
        },
        {
          target: lpToken,
          params: [masterChef],
        },
      ],
      block,
      chain: chain,
    })
  ).output;
    
    const lpTotalSuply = (
    await sdk.api.abi.call({
      target: lpToken,
      abi: 'erc20:totalSupply',
      chain: chain,
      block,
    })
  ).output;
  const token0Locked = (balances[2].output * balances[0].output) / lpTotalSuply;
  const token1Locked = (balances[2].output * balances[1].output) / lpTotalSuply;
  return [
    { token: `${chain}:${token0}`, locked: token0Locked },
    { token: `${chain}:${token1}`, locked: token1Locked },
  ];
};


const farmLocked = async (block) => {
  const balances = {};
  const tokens = farmCronos.tokens;

  const allPools = farmCronos.farms
    .map((t) => {
      return t.pools.map((pool) => {
        return Object.assign(pool, {
          masterChef: t.masterChef,
        });
      });
    })
    .reduce((acc, current) => [...acc, ...current], []);
  const promises = allPools.map((item) => {
    return  farmLPBalance(
          'cronos',
          block,
          item.masterChef,
          item.lpToken,
          tokens[item.token0],
          tokens[item.token1],
        );
  });

  const data = await Promise.all(promises);
  data.forEach((farm) => {
    farm.forEach((item) => {
      balances[item.token] = new BigNumber(balances[item.token] || 0)
        .plus(item.locked || 0)
        .toFixed(0);
    });
  });

  return balances;
};

module.exports = {
  farmLocked,
};
