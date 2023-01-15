const { gql, request } = require("graphql-request");
const { toUSDTBalances } = require("../helper/balances");

function getChainTvl(graphUrls, factoriesName = "uniswapFactories", tvlName = "totalLiquidityUSD", blockCatchupLimit = 500) {
  const graphQuery = gql`
    query get_tvl($block: Int) {
      lbfactories(
        block: { number: $block } 
        first: 1) {
        totalLiquidityUSD: totalValueLockedUSD
      }
    }`;
  return (chain) => {
    return async (_, _b, _cb, { api }) => {
      await api.getBlock();
      let block = api.block;
      let uniswapFactories;

      if (!blockCatchupLimit) {
        uniswapFactories = (await request(graphUrls[chain], graphQuery, { block }))[factoriesName];
      } else {
        uniswapFactories = await request(graphUrls[chain], graphQuery, { block })
      }

      const usdTvl = Number(uniswapFactories['lbfactories'][0][tvlName]);
      return toUSDTBalances(usdTvl);
    };
  };
}

module.exports={
  fantom:{
      tvl: getChainTvl({
          fantom: 'https://api.thegraph.com/subgraphs/name/0xhans1/metropolis-v2'
      })('fantom')
  }
}