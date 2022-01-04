const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { transformBscAddress } = require("../helper/portedTokens");

const NATIVE_CONTRACT = "0x33AdBf5f1ec364a4ea3a5CA8f310B597B8aFDee3";

const bscTvl = async (timestamp, block, chainBlocks) => {
  const balances = {};

  const poolLenth = (
    await sdk.api.abi.call({
      abi: abi.poolLength,
      target: NATIVE_CONTRACT,
      chain: "bsc",
      block: chainBlocks["bsc"],
    })
  ).output;

  const lpPositions = [];

  for (let index = 0; index < poolLenth; index++) {
    const poolInfo = (
      await sdk.api.abi.call({
        abi: abi.poolInfo,
        target: NATIVE_CONTRACT,
        params: index,
        chain: "bsc",
        block: chainBlocks["bsc"],
      })
    ).output;

    const wantBalance = (
      await sdk.api.abi.call({
        abi: abi.wantLockedTotal,
        target: poolInfo[4],
        chain: "bsc",
        block: chainBlocks["bsc"],
      })
    ).output;

    try {
      const symbol = (
        await sdk.api.abi.call({
          abi: abi.symbol,
          target: poolInfo[0],
          chain: "bsc",
          block: chainBlocks["bsc"],
        })
      ).output;

      if (symbol == "Cake-LP" || symbol == "APE-LP" || symbol == "MDEX LP") {
        lpPositions.push({
          token: poolInfo[0],
          balance: wantBalance,
        });
      } else {
        sdk.util.sumSingleBalance(balances, `bsc:${poolInfo[0]}`, wantBalance);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const transformAddress = await transformBscAddress();

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks["bsc"],
    "bsc",
    transformAddress
  );

  return balances;
};

module.exports = {
  bsc: {
    tvl: bscTvl,
  },
  tvl: sdk.util.sumChainTvls([bscTvl]),
};
