const sdk = require("@defillama/sdk");
const ADDRESSES = require('../helper/coreAssets.json')
const { getUniTVL } = require('../helper/unknownTokens');
const { staking } = require('../helper/staking');
const { toUSDTBalances } = require("../helper/balances");
const { gql, default: request } = require("graphql-request");

const graphQuery = gql`
  query get_tvl {
    uniswapFactories {
      totalLiquidityUSD
    }
  }
`

const tvl = async () => {
  const endpoint = sdk.graph.modifyEndpoint('FUWdkXWpi8JyhAnhKL5pZcVshpxuaUQG8JHMDqNCxjPd')
  const { uniswapFactories } = await request(endpoint, graphQuery);
  const usdTvl = uniswapFactories[0].totalLiquidityUSD
  return toUSDTBalances(usdTvl)
}

module.exports = {
  misrepresentedTokens: true,
  polygon:{
    staking: staking("0x958d208Cdf087843e9AD98d23823d32E17d723A1", ADDRESSES.polygon.QUICK),
    tvl
  },
  base: {
    tvl: getUniTVL({factory: '0xEC6540261aaaE13F236A032d454dc9287E52e56A'})
  },
  // dogechain: {
  //   tvl: getUniTVL({factory: '0xC3550497E591Ac6ed7a7E03ffC711CfB7412E57F'})
  // },
  hallmarks:[
    [1611917218, "Aavegotchi LM"],
    [1619095618, "QUICK staking - Dragon's Liar launch"],
    [1619611200, "DeFi season on Polygon PoS begun"],
    [1623851400, "Iron Finance V1 collapse"],
    [1651668418, "QUICK split by 1:1000"],
    [1652481840, "QuickSwap GoDaddy Domain Hijack"]
   ]
}
