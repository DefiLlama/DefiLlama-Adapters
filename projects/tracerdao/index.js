const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const erc20 = require("../helper/abis/erc20.json");

const factoryPoolContract = "0x98C58c1cEb01E198F8356763d5CbA8EB7b11e4E2";
const USDC = "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8";

const arbiTvl = async (chainBlocks) => {
  const balances = {};

  const numOfPools = (
    await sdk.api.abi.call({
      abi: abi.numPools,
      target: factoryPoolContract,
      chain: "arbitrum",
      block: chainBlocks["arbitrum"],
    })
  ).output;

  for (let index = 0; index < numOfPools; index++) {
    const pool = (
      await sdk.api.abi.call({
        abi: abi.pools,
        target: factoryPoolContract,
        params: index,
        chain: "arbitrum",
        block: chainBlocks["arbitrum"],
      })
    ).output;

    const poolBalance = (
      await sdk.api.abi.call({
        abi: erc20.balanceOf,
        target: USDC,
        params: pool,
        chain: "arbitrum",
        block: chainBlocks["arbitrum"],
      })
    ).output;

    sdk.util.sumSingleBalance(balances, `arbitrum:${USDC}`, poolBalance);
  }

  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  arbitrum: {
    tvl: arbiTvl,
  },
  tvl: sdk.util.sumChainTvls([arbiTvl]),
  methodology:
    "We count liquidity on the Leveraged Pools through PoolFactory contract",
};
