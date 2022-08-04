const { request, gql } = require('graphql-request');


const graphUrl = 'https://api-kusama.interlay.io/graphql/graphql';
const graphQuery = gql`
query MyQuery {
   cumulativeVolumePerCurrencyPairs(limit: 1, orderBy: tillTimestamp_DESC, where: {type_eq: Collateral, collateralCurrency_eq: KSM}) {
     amount
   }
 }
`;

async function tvl(timestamp, block) {
   const { cumulativeVolumePerCurrencyPairs } = await request(graphUrl, graphQuery);
   const usdTvl = Number(cumulativeVolumePerCurrencyPairs[cumulativeVolumePerCurrencyPairs.length-1].amount);
   const totalTVL = usdTvl / 10 ** 12
   return {'kusama':totalTVL};
}

module.exports = {
   kintsugi: {
      tvl,
   },
};
