const sdk = require("@defillama/sdk");
const { request, gql } = require("graphql-request");
const { BigNumber } = require("bignumber.js");
const utils = require('./helper/utils');


// Could retrieve https://strapi-matic.poly.market/markets?active=true&_sort=end_date:desc but it is not up to date after end of september
// Old graphql https://api.thegraph.com/subgraphs/name/tokenunion/polymarket-matic 
// New graphql https://api.thegraph.com/subgraphs/name/polymarket/matic-markets-5

// # block: { number: $block }
const graphUrl = 'https://api.thegraph.com/subgraphs/name/polymarket/matic-markets-5'
const graphQuery = gql`
query GET_POLYMARKET($skip: Int, $block: Int) {
    conditions(
      first: 1000
      skip: $skip
    ) { 
      id
      oracle
      questionId
      outcomeSlotCount
      resolutionTimestamp
      fixedProductMarketMakers(
        orderBy: creationTimestamp
      )
       {
        creationTimestamp
        collateralToken {
          id name symbol decimals
        }
        collateralVolume
        scaledCollateralVolume
      }
    }  
}
`;

async function polygon_graphql(timestamp, block) {
  balances = {}
  scaledCollateralVolumeSum = 0
  scaledCollateralVolumes = []
  skip = 0
  // Continue querying graph while end not reached. Hard cap: skip = 5000
  while (skip !== -1) { 
    const { conditions } = await request(
      graphUrl,
      graphQuery, {skip, block}
    );
    skip += 1000
    console.log(`${conditions && conditions.length} conditions found for skip: ${skip}`)
    if (conditions && conditions.length > 0) {
      conditions.forEach(condition => {
        condition.fixedProductMarketMakers.forEach(fpmm => {
          ({collateralToken, collateralVolume, scaledCollateralVolume} = fpmm)
          scaledCollateralVolumeSum += Number(scaledCollateralVolume)
        })
      })
    } 
    else {
      // Stop criteria: no conditions returned by graphql api
      skip = -1
    }
  }
  console.log(`${conditions.length} conditions found`)
  
  return {'polygon:0x2791bca1f2de4661ed88a30c99a7a9449aa84174': scaledCollateralVolumes * 1e6};;
}

// After a market resolves, then the market participants can withdraw their share based on the redemption rate and their contribution at the closing of the market. All participants do not do it immediately though, so volume of every market should be accounted for in TVL
const polymarket_api_url = 'https://strapi-matic.poly.market/markets?_limit=-1&_sort=closed_time:desc' // &active=true
async function polygon(timestamp, block) {
  let markets = await utils.fetchURL(polymarket_api_url)
  const marketsUsdcVolumes = markets.data.reduce((acc, market) => acc + Number(market.volume) || 0, 0); 
  console.log(marketsUsdcVolumes)
  return {'polygon:0x2791bca1f2de4661ed88a30c99a7a9449aa84174': marketsUsdcVolumes * 1e6};
}


module.exports = {
  polygon: {
    tvl: polygon
  },
  tvl: polygon,
  methodology: `TVL is the total quantity of USDC collateral submitted to every polymarket' markets ever opened - once the markets resolve, participants can withdraw theire share given the redeption rate and their input stake, but they do not all do it`
}