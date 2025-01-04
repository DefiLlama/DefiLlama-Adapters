const { gql, request } = require('graphql-request');
const ADDRESSES = require('../helper/coreAssets.json');
const { default: BigNumber } = require('bignumber.js');

const graphUrl = "https://graph.swapx.fi/gql/subgraphs/name/swapx";

async function getTVL(api, isV2) {
    const protocol = isV2 ? "V2" : "V3";

    const graphQuery = gql`
    query PoolFactories {
      poolFactories(where: { protocol: ${protocol} }) {
          totalValueLockedUSD
      }
    }
  `;

  const USDC = ADDRESSES.sonic["USDC.e"];
  const data = await request(graphUrl, graphQuery);
  const tvlUSD = BigNumber(data.poolFactories[0].totalValueLockedUSD).times(1e6).toFixed(0);

  api.addTokens([USDC], [tvlUSD]);
}

module.exports = {
    getTVL
}