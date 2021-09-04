const sdk = require('@defillama/sdk');
const BigNumber = require("bignumber.js");
const { request, gql } = require("graphql-request");
const { toUSDT, toUSDTBalances } = require('../helper/balances');

const xdaiGraphUrl = 'https://api.thegraph.com/subgraphs/name/1hive/honeyswap-xdai'
const polygonGraphUrl = 'https://api.thegraph.com/subgraphs/name/1hive/honeyswap-polygon'
const graphQuery = gql`
{
  honeyswapFactories(first: 1) {
    totalLiquidityUSD
  }
}
`

async function xdaiTvl() {
  const { honeyswapFactories } = await request(xdaiGraphUrl, graphQuery)
  return toUSDTBalances(honeyswapFactories[0]['totalLiquidityUSD'])
}

async function polygonTvl() {
  const { honeyswapFactories } = await request(polygonGraphUrl, graphQuery)
  return toUSDTBalances(honeyswapFactories[0]['totalLiquidityUSD'])
}

module.exports = {
  misrepresentedTokens: true,
  xdai: {
    tvl: xdaiTvl
  },
  polygon: {
    tvl: polygonTvl
  },
  tvl: sdk.util.sumChainTvls([xdaiTvl, polygonTvl])
}