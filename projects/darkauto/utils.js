const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");
const abi = require("./abi.json");
const { getLPData, getTokenPrices, } = require('../helper/unknownTokens');

const farmLPBalance = async (
  chain,
  block,
  lpToken,
  lpLocked,
  token0,
  token1,
) => {
  const balances = (
    await sdk.api.abi.multiCall({
      abi: "erc20:balanceOf",
      calls: [
        {
          target: token0,
          params: [lpToken],
        },
        {
          target: token1,
          params: [lpToken],
        }
      ],
      block,
      chain: chain,
    })
  ).output;

  const lpTotalSuply = (
    await sdk.api.abi.call({
      target: lpToken,
      abi: "erc20:totalSupply",
      chain: chain,
      block,
    })
  ).output;
  const token0Locked = (lpLocked * balances[0].output) / lpTotalSuply;
  const token1Locked = (lpLocked * balances[1].output) / lpTotalSuply;

  return [
    { token: `${chain}:${token0}`, locked: token0Locked },
    { token: `${chain}:${token1}`, locked: token1Locked },
  ];
};



const tvl = async (block, chain, vaultAddress) => {
  const balances = {};
  const { output: poolLength } = await sdk.api.abi.call({
    abi: abi["poolLength"],
    target: vaultAddress,
    chain,
  })
  let calls = []
  for (let i = 0; i < poolLength; i++) {
    calls.push({
      target: vaultAddress,
      params: [i]
    })
  }
  let poolInfos =
    await sdk.api.abi.multiCall({
      abi: abi["poolInfo"],
      calls,
      block,
      chain: chain,
    })
    .then(d => d.output).then(d => d.map(poolInfo => poolInfo.output));

  const lps = poolInfos.map(pool =>{
    return pool.want
  })

  const tokenInfos = await getLPData({block, chain, lps, allLps: false})

  let wanLockedTotals =
    await sdk.api.abi.multiCall({
      abi: abi["wantLockedTotal"],
      calls: poolInfos.map(poolInfo => {
        return {
          target: poolInfo.strategy,
          params: []
        }
      }),
      block,
      chain: chain,
    })
    .then(d => d.output).then(d => d.map(lock => lock.output));

  let requests = [];
  calls.map((item, idx) => {
    const lpAddress = poolInfos[idx].want.toLowerCase();
    if(!tokenInfos[lpAddress])
      return null;

    requests.push(farmLPBalance(
      chain,
      block,
      lpAddress,
      wanLockedTotals[idx],
      tokenInfos[lpAddress].token0Address,
      tokenInfos[lpAddress].token1Address
    ));
  });
  const data = await Promise.all(requests);

  data.forEach((farm) => {
    farm.forEach((item) => {
      balances[item.token] = new BigNumber(balances[item.token] || 0)
        .plus(item.locked || 0)
        .toFixed(0);
    });
  });

  const { updateBalances, prices} = await getTokenPrices({ chain, block, lps, useDefaultCoreAssets: true})
  await updateBalances(balances)
  return balances;
};
module.exports = {
  tvl,
};
