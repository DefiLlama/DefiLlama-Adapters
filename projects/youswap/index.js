const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require('../helper/balances');
const sdk = require('@defillama/sdk')

const graphUrls = {
  ethereum: 'https://api.youswap.info/subgraphs/name/swap',
  heco: 'https://api.youswap.info/subgraphs/name/swap_heco',
  bsc: 'https://heco-api.youswap.com/subgraphs/name/swap_bsc'
}
const graphQuery = gql`
query get_tvl($block: Int) {
  uniswapFactories(
    block: { number: $block }
  ) {
    totalVolumeUSD
    totalLiquidityUSD
  }
}
`;


function chainTvl(chain) {
  return async (timestamp, ethBlock, chainBlocks) => {
    let block;
    if(chain === "ethereum"){
      block=ethBlock;
    }
    block = chainBlocks[chain]
    if(block===undefined){
      block = (await sdk.api.util.lookupBlock(timestamp, {chain})).block
    }
    const { uniswapFactories } = await request(
      graphUrls[chain],
      graphQuery,
      {
        block,
      }
    );
    const usdTvl = Number(uniswapFactories[0].totalLiquidityUSD)

    return toUSDTBalances(usdTvl)
  }
}

module.exports = {
  ethereum: {
    tvl: chainTvl('ethereum'),
  },
  heco: {
    tvl: chainTvl('heco'),
  },
  bsc: {
    tvl: chainTvl('bsc'),
  },
  tvl: sdk.util.sumChainTvls(['ethereum', 'bsc', 'heco'].map(chainTvl))
}