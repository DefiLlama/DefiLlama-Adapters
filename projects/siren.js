
const retry = require('async-retry')
const { GraphQLClient } = require('graphql-request')

const utils = require('./helper/utils');

//This calculates the TVL for siren this value will be off by about 0.1% - 0.2% compared to siren markets because we are using coingecko for prices here.
//On siren markets we get the price for tokens off chain so there is an expected difference.
async function fetch() {

  const sirenSubgraphQL = new GraphQLClient( "https://api.thegraph.com/subgraphs/name/sirenmarkets/protocol",)

  let query = `
                query GetAMMPoolData {
                    amms{
                      id
                      collateralToken{
                        id
                        decimals
                    }
                    poolValueSnapshots(orderBy: timestamp, orderDirection: desc, first: 1 ) {
                      id
                      poolValue
                      timestamp
                    }
                  }
                }
              `
  //Query subgraph for needed data
  const graphQueryResult = await retry ( async bail => sirenSubgraphQL.request(query));

  let tvl = 0;
  let tokenList = [];
  //Loop through first to get token ids that we want to find the price of
  for(amm of graphQueryResult.amms ) { 

    let collateralTokenAddress = amm.collateralToken.id;

    tokenList.push(collateralTokenAddress);
  }

  //get token price from coingecko
  let collateralTokenUSDList = await utils.getPricesFromContract(tokenList);

  //Loop through graphquery again to calcualt the tvl
  for(amm of graphQueryResult.amms ) { 

      let poolValue = amm.poolValueSnapshots[0].poolValue;
      let decimals =  amm.collateralToken.decimals;

      let currentCollateralToken = amm.collateralToken.id;
      
      let price = collateralTokenUSDList.data[currentCollateralToken];

      let convertedDecimalToken = (poolValue / Math.pow(10, decimals));

      let convertedToUSD = convertedDecimalToken * price.usd;

      tvl = tvl + convertedToUSD;
    }

  return tvl;
}

module.exports = {
  
  fetch
}
