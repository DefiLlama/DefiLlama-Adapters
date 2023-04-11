const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { ethers } = require("ethers");
const { getChainTransform } = require("../helper/portedTokens");

const core = {
  arbitrum: "0x1d019f2d14bdb81bab7ba4ec7e20868e669c32b1",
};

async function arbitrumBorrowed(timestamp, block) {
  const chain = "arbitrum";
  const balances = {};

  const allMarkets = (
    await sdk.api.abi.call({
      target: core.arbitrum,
      abi: abi.allMarkets,
      chain,
    })
  ).output;

  const underlyings = (
    await sdk.api.abi.multiCall({
      calls: allMarkets.map((market) => ({ target: market })),
      abi: abi.underlying,
      chain,
    })
  ).output;

  const borrowedBalances = (
    await sdk.api.abi.multiCall({
      calls: allMarkets.map((market) => ({ target: market })),
      abi: abi.totalBorrows,
      chain,
    })
  ).output;

  const transform = await getChainTransform(chain);
  borrowedBalances.forEach(({ output: balance }, idx) => {
    sdk.util.sumSingleBalance(
      balances,
      transform(underlyings[idx].output),
      balance
    );
  });

  return balances;
}

async function arbitrumTVL(_, _1, _2, _3) {
  const chain = "arbitrum";
  const balances = {};

  const allMarkets = (
    await sdk.api.abi.call({
      target: core.arbitrum,
      abi: abi.allMarkets,
      chain,
    })
  ).output;

  const underlyings = (
    await sdk.api.abi.multiCall({
      calls: allMarkets.map((market) => ({ target: market })),
      abi: abi.underlying,
      chain,
    })
  ).output;

  const totalSupplies = (
    await sdk.api.abi.multiCall({
      calls: allMarkets.map((market) => ({ target: market })),
      abi: abi.totalSupply,
      chain,
    })
  ).output;

  const exchangeRates = (
    await sdk.api.abi.multiCall({
      calls: allMarkets.map((market) => ({ target: market })),
      abi: abi.exchangeRate,
      chain,
    })
  ).output;

  const transform = await getChainTransform(chain);
  totalSupplies.forEach(({ output: totalSupply }, idx) => {
    sdk.util.sumSingleBalance(
      balances,
      transform(underlyings[idx].output),
      (totalSupply * exchangeRates[idx].output) / 1e18
    );
  });

  return balances;
}

module.exports = {
  arbitrum: {
    tvl: arbitrumTVL,
    borrowed: arbitrumBorrowed,
  },
};
