const sdk = require("@defillama/sdk");
const erc20 = require("../helper/abis/erc20.json");
const abi = require("./abi.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { transformFantomAddress } = require("../helper/portedTokens");
const { staking } = require("../helper/staking");
const { pool2Exports } = require("../helper/pool2");

const token = "0xd83971F0122916B383548C6788498c8058D1D247";
const shares = "0x75C8240E3A857141a42AE4febd9452a8517bD66a";
const masonry = "0x7e06C95FA5fBEe22d64DF7a150af730594eAEf1e";
const rewardPool = "0x74b0Eb42724e5FE598898cdF4896F087b6Ea51E4";
const HermesGenesisRewardPool =
  "0x2b93dc5497D4C544aeA4d06AC8e758cdbfc3cc9B";
const pool2LPs = [
  "0x3407ebBa61C60401CE6b3A6dca782c7EBd21A827", // HERMES-FTM spLP
  "0xd64Cff2dd304cFD6125255Ee706e6c02AFa31cBF", // ARES-WFTM spLP
];
const omb3Tvl = async (chainBlocks) => {
  const balances = {};

  const lpPositions = [];
  let poolInfoReturn = "";
  i = 0;
  do {
    try {
      const token = (
        await sdk.api.abi.call({
          abi: abi.poolInfo,
          target: HermesGenesisRewardPool,
          params: i,
          chain: "fantom",
          block: chainBlocks["fantom"],
        })
      ).output.token;

      const getTokenBalance = (
        await sdk.api.abi.call({
          abi: erc20.balanceOf,
          target: token,
          params: HermesGenesisRewardPool,
          chain: "fantom",
          block: chainBlocks["fantom"],
        })
      ).output;

      const getTokenSymbol = (
        await sdk.api.abi.call({
          abi: abi.symbol,
          target: token,
          chain: "fantom",
          block: chainBlocks["fantom"],
        })
      ).output;

      if (getTokenSymbol.includes("LP")) {
        lpPositions.push({
          token: token,
          balance: getTokenBalance,
        });
      } else {
        sdk.util.sumSingleBalance(
          balances,
          `fantom:${token.toLowerCase()}`,
          getTokenBalance
        );
      }
    } catch (error) {
      poolInfoReturn = error.reason;
    }
    i += 1;
  } while (poolInfoReturn != "missing revert data in call exception");

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
// node test.js projects/olympus-finance/index.js
async function tvl(timestamp, block, chainBlocks) {
  let balances = await omb3Tvl(chainBlocks);
  delete balances[`fantom:${token}`];
  delete balances[`fantom:${shares}`];
  return balances;
}
async function stakings(timestamp, block, chainBlocks) {
  let [balances, coreTvl] = await Promise.all([
    staking(masonry, shares, "fantom")(timestamp, block, chainBlocks),
    omb3Tvl(chainBlocks),
  ]);
  balances[`fantom:${token}`] =
    `fantom:${token}` in balances
      ? Number(balances[`fantom:${token}`]) + Number(coreTvl[`fantom:${token}`])
      : coreTvl[`fantom:${token}`];
  balances[`fantom:${shares}`] =
    `fantom:${shares}` in balances
      ? Number(balances[`fantom:${shares}`]) +
        Number(coreTvl[`fantom:${shares}`])
      : Number(coreTvl[`fantom:${shares}`]);
  return balances;
}
module.exports = {
  fantom: {
    tvl,
    staking: stakings,
    pool2: pool2Exports(rewardPool, pool2LPs, "fantom"),
  },
};