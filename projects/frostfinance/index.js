const sdk = require("@defillama/sdk");
const erc20 = require("../helper/abis/erc20.json");
const abi = require("./abi.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { transformAvaxAddress } = require("../helper/portedTokens");

const STAKING_CONTRACT = "0x87f1b38D0C158abe2F390E5E3482FDb97bC8D0C5";

const avaxTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const lengthPool = (
    await sdk.api.abi.call({
      abi: abi.poolLength,
      target: STAKING_CONTRACT,
      chain: "avax",
      block: chainBlocks["avax"],
    })
  ).output;

  const lpPositions = [];

  for (let index = 0; index < lengthPool; index++) {
    const lpOrTokens = (
      await sdk.api.abi.call({
        abi: abi.poolInfo,
        target: STAKING_CONTRACT,
        params: index,
        chain: "avax",
        block: chainBlocks["avax"],
      })
    ).output[0];

    const lpOrToken_bal = (
      await sdk.api.abi.call({
        abi: erc20.balanceOf,
        target: lpOrTokens,
        params: STAKING_CONTRACT,
        chain: "avax",
        block: chainBlocks["avax"],
      })
    ).output;

    if (
      (index >= 2 && index <= 7) ||
      index == 9 ||
      (index >= 13 && index <= 15) ||
      index == 17
    ) {
      sdk.util.sumSingleBalance(balances, `avax:${lpOrTokens}`, lpOrToken_bal);
    } else {
      lpPositions.push({
        token: lpOrTokens,
        balance: lpOrToken_bal,
      });
    }
  }

  const transformAddress = await transformAvaxAddress();

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks["avax"],
    "avax",
    transformAddress
  );

  return balances;
};

module.exports = {
  avax: {
    tvl: avaxTvl,
  },
  tvl: sdk.util.sumChainTvls([avaxTvl]),
  methodology:
    "We add as tvl from the farming pools (ICICLE => LP Pairs && SNOWFLAKE => Single Tokens) threw StakingContract(MasterChefV2)",
};
