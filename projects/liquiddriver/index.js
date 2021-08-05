const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const erc20 = require("../helper/abis/erc20.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { transformFantomAddress } = require("../helper/portedTokens");

// --- All sushitokens lp tokens are staked here for LQDR tokens ---
const MASTERCHEF = "0x742474dae70fa2ab063ab786b1fbe5704e861a0c";

const fantomTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const poolLength = (
    await sdk.api.abi.call({
      abi: abi.poolLength,
      target: MASTERCHEF,
      chain: "fantom",
      block: chainBlocks["fantom"],
    })
  ).output;

  const lpPositions = [];

  for (let i = 0; i < poolLength; i++) {
    const poolInfo = (
      await sdk.api.abi.call({
        abi: abi.poolInfo,
        target: MASTERCHEF,
        params: i,
        chain: "fantom",
        block: chainBlocks["fantom"],
      })
    ).output;

    const balance = (
      await sdk.api.abi.call({
        abi: erc20.balanceOf,
        target: poolInfo[0],
        params: MASTERCHEF,
        chain: "fantom",
        block: chainBlocks["fantom"],
      })
    ).output;

    lpPositions.push({
      token: poolInfo[0],
      balance,
    });
  }

  const transformAddress = await transformFantomAddress();

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks["fantom"],
    "fantom",
    transformAddress
  );

  return balances;
};

module.exports = {
  fantom: {
    tvl: fantomTvl,
  },
  tvl: sdk.util.sumChainTvls([fantomTvl]),
};
