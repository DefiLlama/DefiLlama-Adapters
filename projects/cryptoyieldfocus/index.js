const sdk = require("@defillama/sdk");
const erc20 = require("../helper/abis/erc20.json");
const abi = require("./abi.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { transformAvaxAddress } = require("../helper/portedTokens");

const STAKING_CONTRACT = "0xaB0141F81b3129f03996D0679b81C07F6A24c435";

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
      index == 7 ||
      (index >= 8 && index <= 13) ||
      (index >= 15 && index <= 16) || 
      index == 18
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
    "We add the tvl from the farming pools fetching from StakingContract",
};
