const sdk = require("@defillama/sdk");
const FACTORY_ADDRESS = "0xa5136eAd459F0E61C99Cec70fe8F5C24cF3ecA26";
const WETH_ADDRESS = "0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f";
const { getBlock } = require("../helper/http");

module.exports = {
  methodology: `Sums on-chain tvl by getting pools using xfai factory`,
  start: 1692347965 , // Aug-18-2023 08:39:25 AM +UTC
  linea: {
    tvl: async (timestamp, _, chainBlocks, { api }) => {
      const block = await getBlock(timestamp, "linea", chainBlocks);

      const { output: numOfPools } = await sdk.api.abi.call({
        chain: "linea",
        abi: "uint256:allPoolsLength",
        target: FACTORY_ADDRESS,
        block,
      });

      let { output: pools } = await sdk.api.abi.multiCall({
        abi: "function allPools(uint256) external view returns (address)",
        calls: [...Array(Number(numOfPools)).keys()].map((i) => ({
          params: [i],
          target: FACTORY_ADDRESS,
        })),
        chain: "linea",
        block,
      });
      pools = pools.map(({ output }) => output);

      let { output: tokens } = await sdk.api.abi.multiCall({
        abi: "address:poolToken",
        calls: pools.map((p) => ({
          params: [],
          target: p,
        })),
        chain: "linea",
        block,
      });
      const tokens_pairs = tokens.map(({ input, output }) => [
        input.target,
        output,
      ]);
      let { output: balances } = await sdk.api.abi.multiCall({
        abi: "erc20:balanceOf",
        calls: pools.map((pool) => ({
          params: [pool],
          target: WETH_ADDRESS,
        })),
        chain: "linea",
        block,
      });

      let { output: tokenBalances } = await sdk.api.abi.multiCall({
        abi: "erc20:balanceOf",
        calls: tokens_pairs.map(([pool, token]) => ({
          params: [pool],
          target: token,
        })),
        chain: "linea",
        block,
      });

      balances.map(({ output, input }) => {
        api.add(WETH_ADDRESS, output);
      });
      tokenBalances.map(({ output, input }) => {
        api.add(input.target, output);
      });
    },
  },
};
