const sdk = require("@defillama/sdk");
const erc20 = require("../helper/abis/erc20.json");
const abi = require("./abi.json");

const staking_contract = "0x5A753021CE28CBC5A7c51f732ba83873D673d8cC";

const assets = [
  // other tokens which probably for some reason was sent to the contract accidentally
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  "0xdac17f958d2ee523a2206206994597c13d831ec7",
  "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
];

const ethTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const token = (
    await sdk.api.abi.call({
      abi: abi.token,
      target: staking_contract,
      block: ethBlock,
    })
  ).output;

  const currentTotalStake = (
    await sdk.api.abi.call({
      abi: abi.currentTotalStake,
      target: staking_contract,
      block: ethBlock,
    })
  ).output;

  sdk.util.sumSingleBalance(balances, token, currentTotalStake);

  for (let i = 0; i < assets.length; i++) {
    const assetsBalance = (
      await sdk.api.abi.call({
        abi: erc20.balanceOf,
        target: assets[i],
        params: staking_contract,
        block: ethBlock,
      })
    ).output;

    sdk.util.sumSingleBalance(balances, assets[i], assetsBalance);
  }

  return balances;
};

module.exports = {
  eth: {
    tvl: ethTvl,
  },
  tvl: sdk.util.sumChainTvls([ethTvl]),
};
