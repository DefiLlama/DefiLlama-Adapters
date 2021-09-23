const sdk = require("@defillama/sdk");
const erc20 = require("../helper/abis/erc20.json");
const abi = require("./abi.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { transformBscAddress } = require("../helper/portedTokens");

const MASTERCHEF_CONTRACT = "0xA9a438B8b2E41B3bf322DBA139aF9490DC226953";

const bscTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const poolLenth = (
    await sdk.api.abi.call({
      abi: abi.poolLength,
      target: MASTERCHEF_CONTRACT,
      chain: "bsc",
      block: chainBlocks["bsc"],
    })
  ).output;

  const lpPositions = [];

  for (let index = 0; index < poolLenth; index++) {
    const token = (
      await sdk.api.abi.call({
        abi: abi.poolInfo,
        target: MASTERCHEF_CONTRACT,
        params: index,
        chain: "bsc",
        block: chainBlocks["bsc"],
      })
    ).output[0];

    const token_balance = (
      await sdk.api.abi.call({
        abi: erc20.balanceOf,
        target: token,
        params: MASTERCHEF_CONTRACT,
        chain: "bsc",
        block: chainBlocks["bsc"],
      })
    ).output;

    if (index >= 5 && index <= 10) {
      sdk.util.sumSingleBalance(balances, `bsc:${token}`, token_balance);
    } else {
      lpPositions.push({
        token,
        balance: token_balance,
      });
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
