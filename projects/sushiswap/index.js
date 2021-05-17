const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require('../helper/balances');
const {calculateUniTvl} = require('../helper/calculateUniTvl.js')
const sdk = require('@defillama/sdk')

const graphUrl = 'https://api.thegraph.com/subgraphs/name/zippoxer/sushiswap-subgraph-fork'
const graphQuery = gql`
query get_tvl($block: Int) {
  uniswapFactory(
    id: "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac",
    block: { number: $block }
  ) {
    totalVolumeUSD
    totalLiquidityUSD
  }
}
`;

async function eth(timestamp, block) {
  const {uniswapFactory} = await request(
    graphUrl,
    graphQuery,
    {
      block,
    }
  );
  const usdTvl = Number(uniswapFactory.totalLiquidityUSD)

  return toUSDTBalances(usdTvl)
}

async function polygon(timestamp, ethBlock, chainBlocks){
  return calculateUniTvl(addr=>{
    if(addr === '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619'){
      return '0x0000000000000000000000000000000000000000'
    }
    return `polygon:${addr}`
  }, chainBlocks['polygon'], 'polygon', '0xc35DADB65012eC5796536bD9864eD8773aBc74C4', 11333218);
}

module.exports = {
  ethereum:{
    tvl: eth,
  },
  polygon: {
    tvl: polygon
  },
  tvl: sdk.util.sumChainTvls([eth, polygon])
}