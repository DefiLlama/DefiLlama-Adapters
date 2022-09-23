const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require('../helper/balances')
const { staking } = require('../helper/unknownTokens')


const MasterChefContract = "0x065AAE6127D2369C85fE3086b6707Ac5dBe8210a";
const WojkPoolContract = "0xDF21058099e69D3635005339721C4826c4c47F8A";
const WOJK = "0x570C41a71b5e2cb8FF4445184d7ff6f78A4DbcBD";

const chain = 'dogechain'

const lps = ['0xC1FaBe61B9cFC005a51e1Ea899C3D65fb6392497']

const graphEndpoint = 'https://api.dogechainhealth.com/subgraphs/name/wojakswap/exchange'
const currentQuery = gql`
query pancakeFactories {
  pancakeFactories(first: 1) {
    totalLiquidityUSD
  }
}
`
const historicalQuery = gql`
query pancakeDayDatas {
pancakeDayDatas(
  first: 1000
  orderBy: date
  orderDirection: asc
  ) {
    date
    dailyVolumeUSD
    totalLiquidityUSD
    __typename
  }
}
`
async function tvl(timestamp, ethBlock, chainBlocks) {
  if (Math.abs(timestamp - Date.now() / 1000) < 3600) {
    const tvl = await request(graphEndpoint, currentQuery, {}, {
      "referer": "https://wojak.fi/",
      "origin": "https://wojak.fi",
    })
    return toUSDTBalances(tvl.pancakeFactories[0].totalLiquidityUSD)
  } else {
    const tvl = (await request(graphEndpoint, historicalQuery)).pancakeDayDatas
    let closest = tvl[0]
    tvl.forEach(dayTvl => {
      if (Math.abs(dayTvl.date - timestamp) < Math.abs(closest.date - timestamp)) {
        closest = dayTvl
      }
    })
    return toUSDTBalances(closest.totalLiquidityUSD)
  }
}
module.exports = {
    misrepresentedTokens: true,
    doublecounted: false,
    timetravel: true,
    incentivized: true,
    methodology: 'TVL accounts for the liquidity on all AMM pools, using the TVL chart on https://wojak.fi/info as the source. Staking accounts for the WOJK locked in MasterChef (0x065AAE6127D2369C85fE3086b6707Ac5dBe8210a)',
    dogechain: {
        tvl,
        staking: staking({
            chain,
            owners: [MasterChefContract, WojkPoolContract],
            tokens: [WOJK],
            useDefaultCoreAssets: true,
            lps,
           })
    },
};
        
 


