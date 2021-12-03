const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require("../helper/balances");
const { getBlock } = require("../helper/getBlock");

function getChainTvl(
  graphUrls,
  factoriesName = "uniswapFactories",
  tvlName = "totalLiquidityUSD"
) {
  const graphQuery = gql`
query get_tvl($block: Int) {
  ${factoriesName}(
    block: { number: $block }
  ) {
    ${tvlName}
  }
}
`;
  return (chain) => {
    return async (timestamp, ethBlock, chainBlocks) => {
      const block = await getBlock(timestamp, chain, chainBlocks);
      const uniswapFactories = (
        await request(graphUrls[chain], graphQuery, {
          block,
        })
      )[factoriesName];
      const usdTvl = Number(uniswapFactories[0][tvlName]);

      return toUSDTBalances(usdTvl);
    };
  };
}

function getChainTvlBuffered(
  graphUrls,
  bufferSeconds,
  factoriesName = "uniswapFactories",
  tvlName = "totalLiquidityUSD"
) {
  const chainFn = getChainTvl(graphUrls, factoriesName, tvlName);
  return (chain) => {
    const tvl = chainFn(chain);
    return async (timestamp, ethBlock, chainBlocks) => {
      timestamp -= bufferSeconds;
      for (const chainName in chainBlocks) {
        chainBlocks[chainName] = await getBlock(
          timestamp,
          chainName,
          {},
          false
        );
      }
      ethBlock = chainBlocks["ethereum"];
      return await tvl(timestamp, ethBlock, chainBlocks);
    };
  };
}

function getAvaxUniswapTvl(
  graphUrl,
  factoriesName = "uniswapFactories",
  tvlName = "totalLiquidityETH"
) {
  const graphQuery = gql`
query get_tvl($block: Int) {
  ${factoriesName}(
    block: { number: $block }
  ) {
    ${tvlName}
  }
}
`;
  return async (timestamp, ethBlock, chainBlocks) => {
    const response = await request(graphUrl, graphQuery, {
      block: chainBlocks.avax,
    });

    return {
      "avalanche-2": Number(response[factoriesName][0].totalLiquidityETH),
    };
  };
}

module.exports = {
  getChainTvl,
  getChainTvlBuffered,
  getAvaxUniswapTvl,
};
