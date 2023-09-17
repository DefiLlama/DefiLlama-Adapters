const { cachedGraphQuery } = require('../helper/cache')
const { gql, request }  = require('graphql-request'); 
const graphUrl = 'https://api.thegraph.com/subgraphs/name/nuoanunu/defilahman-tvl';
const subgraphUrl = "https://api.thegraph.com/subgraphs/name/aave/protocol-v2";

async function tvl(timestamp, block, _, { api }) {
   const totalTVL = await cachedGraphQuery('honotvl', graphUrl, '{  tvlSUMs {    amountETH    amount   }}');
   const totalETH = totalTVL.tvlSUMs[0].amountETH/1e18;
   const totalUSDC = totalTVL.tvlSUMs[0].amount;
   const ethPrice = 1 / ((await request(subgraphUrl, '{  priceOracleAsset(id: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48") {    priceInEth   }}')).priceOracleAsset.priceInEth / 1e18);
   console.log(totalUSDC/1e6);
   console.log(totalETH);
   console.log(ethPrice);
   console.log(ethPrice*totalETH);
   console.log(totalUSDC/1e6  + ethPrice*totalETH);
   return api.addToken('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', (totalUSDC/1e6  + ethPrice*totalETH)*1e6)
}
module.exports = {
   methodology: 'TVL will be the sum of 1- total value ofETH backing HONO price and 2- Amount of LP managing by our LP Manager contract',
   ethereum: {
      tvl,
   },
};
