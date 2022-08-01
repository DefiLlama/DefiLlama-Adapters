const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

// Both v1 and v2 factories
const factoryPoolContracts = ["0x98C58c1cEb01E198F8356763d5CbA8EB7b11e4E2", "0x3Feafee6b12C8d2E58c5B118e54C09F9273c6124"];
const USDC = "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8";

const arbiTvl = async (chainBlocks) => {
  const balances = {};
  const numOfPoolsFirstFactory = (
    await sdk.api.abi.call({
      abi: abi.numPools,
      target: factoryPoolContracts[0],
      chain: "arbitrum",
      block: chainBlocks["arbitrum"],
    })
  ).output;

  for (let index = 0; index < numOfPoolsFirstFactory; index++) {
    const pool = (
      await sdk.api.abi.call({
        abi: abi.pools,
        target: factoryPoolContracts[0],
        params: index,
        chain: "arbitrum",
        block: chainBlocks["arbitrum"],
      })
    ).output;

    const poolBalance = (
      await sdk.api.abi.call({
        abi: 'erc20:balanceOf',
        target: USDC,
        params: pool,
        chain: "arbitrum",
        block: chainBlocks["arbitrum"],
      })
    ).output;

    sdk.util.sumSingleBalance(balances, `arbitrum:${USDC}`, poolBalance);
  }

  const numOfPoolsSecondFactory = (
    await sdk.api.abi.call({
      abi: abi.numPools,
      target: factoryPoolContracts[1],
      chain: "arbitrum",
      block: chainBlocks["arbitrum"],
    })
  ).output;

  for (let index = 0; index < numOfPoolsSecondFactory; index++) {
    const pool = (
      await sdk.api.abi.call({
        abi: abi.pools,
        target: factoryPoolContracts[1],
        params: index,
        chain: "arbitrum",
        block: chainBlocks["arbitrum"],
      })
    ).output;

    const poolBalance = (
      await sdk.api.abi.call({
        abi: 'erc20:balanceOf',
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
  methodology:
    "We count liquidity on the Leveraged Pools through PoolFactory contract",
};
