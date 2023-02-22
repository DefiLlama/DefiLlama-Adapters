const { getUniTVL } = require("../helper/unknownTokens");
const sdk = require("@defillama/sdk");
const { pools, farms } = require("./contracts.json");
const tokenAbi  = require("../helper/abis/erc20.json");
const poolAbi = require("./pool.json");

const chain = "fantom";

async function staking(timestamp, block, chainBlocks) {
  let balances = {};

  pools.forEach(async (pool) => {
    const rewardToken = await sdk.api.abi.call({
      abi: poolAbi.rewardsToken,
      target: pool,
      chain,
    });

    const balance = await sdk.api.abi.call({
        abi: tokenAbi.balanceOf,
        target: rewardToken.output,
        params: pool,
        chain
    })

    sdk.util.sumSingleBalance(balances,`${chain}:${rewardToken.output}`, balance.output);
  });

  farms.forEach(async farm => {
    const token = farm.token;
    const balance = await sdk.api.abi.call({
        abi: tokenAbi.balanceOf,
        target: token,
        params: farm.contract,
        chain
    })

    sdk.util.sumSingleBalance(balances,`${chain}:${token}`, balance.output);
  })

  return balances;
}

module.exports = {
  fantom: {
    tvl: getUniTVL({
      chain,
      useDefaultCoreAssets: true,
      factory: "0x7ceb5f3a6d1888eec74a41a5377afba5b97200ea",
    }),
    staking: staking
  },
};
