const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const erc20 = require("../helper/abis/erc20.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { transformKccAddress } = require("../helper/portedTokens");

const masterChefContract = "0x243e46d50130f346bede1d9548b41c49c6440872";

const kccTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const poolLength = (
    await sdk.api.abi.call({
      abi: abi.poolLength,
      target: masterChefContract,
      chain: "kcc",
      block: chainBlocks["kcc"],
    })
  ).output;

  const lpPositions = [];

  for (let index = 0; index < poolLength; index++) {
    const lpTokens_sToken = (
      await sdk.api.abi.call({
        abi: abi.poolInfo,
        target: masterChefContract,
        params: index,
        chain: "kcc",
        block: chainBlocks["kcc"],
      })
    ).output[0];

    const lpToken_sToken_bal = (
      await sdk.api.abi.call({
        abi: erc20.balanceOf,
        target: lpTokens_sToken,
        params: masterChefContract,
        chain: "kcc",
        block: chainBlocks["kcc"],
      })
    ).output;

    if (index == 1 || index == 3 || index == 5 || index == 8) {
      sdk.util.sumSingleBalance(
        balances,
        `kcc:${lpTokens_sToken}`,
        lpToken_sToken_bal
      );
    } else {
      lpPositions.push({
        token: lpTokens_sToken,
        balance: lpToken_sToken_bal,
      });
    }
  }

  const transformAddress = await transformKccAddress();

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks["kcc"],
    "kcc",
    transformAddress
  );
  balances['0xdac17f958d2ee523a2206206994597c13d831ec7'] /= 10 ** 12;
  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  methodology: "We count liquidity on the farms (LP tokens) and pools(single tokens) threw masterchef contract",
  kcc: {
    tvl: kccTvl,
  },
};