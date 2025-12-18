const sdk = require("@defillama/sdk");
const ADDRESSES = require('../helper/coreAssets.json')
const { getUniTVL } = require('../helper/unknownTokens');
const { staking } = require('../helper/staking');
const { toUSDTBalances } = require("../helper/balances");
const { gql, default: request } = require("graphql-request");

const COMBINED_Q = gql`
  query get_tvl($block: Int!) {
    meta: _meta { block { number } }
    uniswapFactories(block: { number: $block }) {
      totalLiquidityUSD
    }
  }
`

const tvl = async (api) => {
  const endpoint = sdk.graph.modifyEndpoint("FUWdkXWpi8JyhAnhKL5pZcVshpxuaUQG8JHMDqNCxjPd")
  const block = (await api.getBlock()) - 500
  const { meta, uniswapFactories } = await request(endpoint, COMBINED_Q, { block })

  const head = meta.block.number
  if (head < block) throw new Error(`Subgraph behind: head=${head}, need >= ${block}`)

  const usdTvl = Number(uniswapFactories?.[0]?.totalLiquidityUSD ?? 0)
  if (usdTvl < 200_000_000) throw new Error(`Suspicious TVL: ${usdTvl} < 200,000,000 (likely bad indexer/stale data)`)
  return toUSDTBalances(usdTvl)
}

module.exports = {
  misrepresentedTokens: true,
  polygon:{
    staking: staking("0x958d208Cdf087843e9AD98d23823d32E17d723A1", ADDRESSES.polygon.QUICK),
    tvl
  },
  base: { tvl: getUniTVL({factory: '0xEC6540261aaaE13F236A032d454dc9287E52e56A', useDefaultCoreAssets: true}) },
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