const sdk = require("@defillama/sdk");
const { request, gql } = require("graphql-request");
const { BigNumber } = require("bignumber.js");
const utils = require('./helper/utils');


// Can retrieve https://strapi-matic.poly.market/markets?active=true&_sort=end_date:desc 
// Old graphql https://api.thegraph.com/subgraphs/name/tokenunion/polymarket-matic 
// New graphql https://api.thegraph.com/subgraphs/name/polymarket/matic-markets-5

// Useful resources : https://polymarketwhales.info/markets and https://polymarket.com/

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
  let scaledCollateralVolumeSum = 0
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
  
  return {'polygon:0x2791bca1f2de4661ed88a30c99a7a9449aa84174': scaledCollateralVolumeSum * 1e6};;
}

// After a market resolves, then the market participants can withdraw their share based on the redemption rate and their contribution at the closing of the market. All participants do not do it immediately though, so volume of every market should be accounted for in TVL
// const polymarket_api_url = 'https://strapi-matic.poly.market/markets?_limit=-1&_sort=closed_time:desc' // &active=true

const polymarket_api_url = 'https://strapi-matic.poly.market/markets?_limit=-1&_sort=volume:desc' // &active=true
async function polygon(timestamp, block) {
  let markets = await utils.fetchURL(polymarket_api_url)

  // Filter out unwanted fields
  markets = markets.data.map(({ id, slug, volume, liquidity, created_at, closed }) => ({id, slug, volume, liquidity, created_at, closed})); 
  markets.forEach(market => {
    market.volume = Number(market.volume) || 0
    market.liquidity = Number(market.liquidity) || 0
    if (market.liquidity < 0) market.liquidity = 0
  }); 
  
  const tvl = markets.reduce((acc, market) => acc + market.liquidity, 0); 
  
  return {'polygon:0x2791bca1f2de4661ed88a30c99a7a9449aa84174': tvl * 1e6};
}


module.exports = {
  polygon: {
    tvl: polygon
  },
  //tvl: polygon,
  methodology: `TVL is the total quantity of USDC collateral submitted to every polymarket' markets ever opened - once the markets resolve, participants can withdraw theire share given the redeption rate and their input stake, but they do not all do it`
}

/*
const largeMarkets = markets.filter(market => market.volume > 1e5)
console.log('\n\n', largeMarkets, `\n\n${largeMarkets.length} markets with volume above 100k` )

const bad_liquidity = [
  'how-many-tweets-will-donald-j-trump-jr-post-from-jan-18th-to-25th', 
  'will-the-buffalo-bills-or-the-kansas-city-chiefs-win-the-afc-championship',
  'will-weekly-jobless-claims-exceed-348k-for-the-week-ending-on-august-21', 
  'who-will-win-suns-v-clippers-western-conference-finals-game-3', 
  'will-fabiano-caruana-win-the-2021-sinquefield-cup',
  'will-f9-gross-more-than-62m-domestically-on-opening-weekend',
  'will-the-mavericks-or-the-jazz-win-their-january-29th-matchup',
  'will-fewociouss-his-name-is-victor-have-a-final-sale-price-of-more-than-850k-at-christies',
  'will-fewociouss-my-mamas-dream-have-a-final-sale-price-of-more-than-650k-at-christies',
]


const csvString = [
  [ 'id', 'slug', 'volume', 'liquidity', 'created_at', 'closed'],
  ...markets.map(m => [m.id, m.slug, m.volume, m.liquidity, m.created_at, m.closed])
]
 .map(e => e.join(',')) 
 .join('\n');
console.log(csvString);
const fs = require('fs')
fs.writeFile('D:/Users/TERRAIN-PC/Downloads/polymarket_tvl.csv', csvString, err => {
  if (err) {
    console.error(err)
    return
  }
  //file written successfully
})
*/