const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const factory = "0x833e4083B7ae46CeA85695c4f7ed25CDAd8886dE";

const ethTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const poolLength = Number(
    (
      await sdk.api.abi.call({
        target: factory,
        abi: abi.allPoolsLength,
        block: ethBlock,
      })
    ).output
  );

  const allPoolNums = Array.from(Array(poolLength).keys());

  const poolAddresses = (
    await sdk.api.abi.multiCall({
      abi: abi.allPools,
      calls: allPoolNums.map((num) => ({
        target: factory,
        params: [num],
      })),
      block: ethBlock,
    })
  ).output.map((el) => el.output);

  for (let i = 0; i < poolAddresses.length; i++) {
    const token0 = (
      await sdk.api.abi.call({
        target: poolAddresses[i],
        abi: abi.token0,
        block: ethBlock,
      })
    ).output;

    const token1 = (
      await sdk.api.abi.call({
        target: poolAddresses[i],
        abi: abi.token1,
        block: ethBlock,
      })
    ).output;

    const getReserves = (
      await sdk.api.abi.call({
        target: poolAddresses[i],
        abi: abi.getReserves,
        block: ethBlock,
      })
    ).output;

    sdk.util.sumSingleBalance(balances, token0, getReserves[0]);

    sdk.util.sumSingleBalance(balances, token1, getReserves[1]);
  }

  return balances;
};

module.exports = {
  ethereum: {
    tvl: ethTvl,
  },
  tvl: sdk.util.sumChainTvls([ethTvl]),
};
