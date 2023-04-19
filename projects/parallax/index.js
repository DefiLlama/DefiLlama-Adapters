const sdk = require("@defillama/sdk");
const prllxERC20 = require("./abis/prllxERC20.json");
const contracts = require("./contracts.json");
const { default: BigNumber } = require("bignumber.js");
const { getPrice } = require("./getPrice");

async function tvl(time, _ethBlock, { arbitrum: block }) {
  const strategyId = (
    await sdk.api.abi.call({
      block,
      target: contracts["parallaxCoreAddress"],
      params: contracts["strategyAddress"],
      abi: prllxERC20["strategyToId"],
      chain: "arbitrum",
    })
  ).output;

  const strategy = (
    await sdk.api.abi.call({
      block,
      target: contracts["parallaxCoreAddress"],
      params: strategyId,
      abi: prllxERC20["strategies"],
      chain: "arbitrum",
    })
  ).output;

  const balances = {};
  const { price, decimals } = await getPrice(contracts["lpAddresss"], block);

  const totalStaked = new BigNumber(strategy.totalStaked).div(`1e${decimals}`);
  const totalStakedTVL = price.times(totalStaked).times(1e6).toFixed(0);

  sdk.util.sumSingleBalance(
    balances,
    `arbitrum:${contracts["usdc"]}`,
    totalStakedTVL
  );

  return balances;
}

module.exports = {
  methodology: "TVL comes from the Staking Vaults",
  arbitrum: {
    tvl,
  },
};
