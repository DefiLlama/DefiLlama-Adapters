const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { transformHecoAddress } = require("../helper/portedTokens");
const tvlOnPairs = require("../helper/processPairs.js");

// Both contracts will need breakdown of lp pairs `unwrapUniswapLPs`
const factory = "0xe0367ec2bd4Ba22B1593E4fEFcB91D29DE6C512a";
const pool = "0x55bf276e2a2e10AEB62c0Ed37D36585cB24d9cC1";

const hecoTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  // factory section tvl
  await tvlOnPairs("heco", chainBlocks, factory, balances);

  // pool section tvl
  const poolLen = (
    await sdk.api.abi.call({
      abi: abi.poolLength,
      target: pool,
      chain: "heco",
      block: chainBlocks["heco"],
    })
  ).output;

  const lpPositions = [];

  for (let index = 0; index < poolLen; index++) {
    const poolInfo = (
      await sdk.api.abi.call({
        abi: abi.poolInfo,
        target: pool,
        params: index,
        chain: "heco",
        block: chainBlocks["heco"],
      })
    ).output;

    lpPositions.push({
      token: poolInfo[0],
      balance: poolInfo[5],
    });
  }

  const transformAddress = await transformHecoAddress();

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks["heco"],
    "heco",
    transformAddress
  );

  return balances;
};

module.exports = {
  heco: {
    tvl: hecoTvl,
  },
  tvl: sdk.util.sumChainTvls([hecoTvl]),
};
