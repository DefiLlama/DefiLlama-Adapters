const sdk = require("@defillama/sdk");
const { staking } = require("../helper/staking");
const MasterMagpieAbi = require("../magpiexyz/abis/masterMagpie.json");
const config = require("./config");

async function tvl(timestamp, block, chainBlocks, { api }) {
  const { masterPenpie, pendleStaking, vePENDLE, PENDLE } = config[api.chain];

  const poolTokens = await api.fetchList({
    lengthAbi: MasterMagpieAbi.poolLength,
    itemAbi: MasterMagpieAbi.registeredToken,
    target: masterPenpie,
  });

  const decimals = await api.multiCall({
    abi: "erc20:decimals",
    calls: poolTokens,
  });

  const balances = {};
  poolTokens.push(vePENDLE);
  decimals.push("18");

  const bals = await api.multiCall({
    abi: "erc20:balanceOf",
    calls: poolTokens.map((i) => ({ target: i, params: pendleStaking })),
  });

  bals.forEach((v, i) => {
    v /= 10 ** (18 - decimals[i]);
    sdk.util.sumSingleBalance(
      balances,
      poolTokens[i] == vePENDLE ? PENDLE : poolTokens[i],
      v,
      api.chain
    );
  });

  return balances;
}

Object.keys(config).forEach((chain) => {
  const { masterPenpie, mPENDLE } = config[chain];
  module.exports[chain] = {
    doublecounted: true,
    tvl: tvl,
    staking: staking(masterPenpie, mPENDLE),
  };
});
