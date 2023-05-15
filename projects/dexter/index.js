const {GraphQLClient, gql} = require('graphql-request');
const {toUSDTBalances} = require("../helper/balances");

const dexterSubgraphEndpoint = "https://api.core-1.dexter.zone/v1/graphql";
const dexterVaultAddr = "persistence1k8re7jwz6rnnwrktnejdwkwnncte7ek7gt29gvnl3sdrg9mtnqkstujtpg";

const currentTvlOp = gql`
    query defillama_current_tvl($vault: String, $date: date) {
        tvl: pool_daily_closing_data_aggregate(where: {vault_address: {_eq: $vault}, date: {_eq: $date}}) {
            aggregate {
                sum {
                    liquidity
                }
            }
        }
    }
`;

async function getTvlAtTime(timestamp) {
  const date = new Date(timestamp * 1000);
  const dateStr = `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`;

  const graphQLClient = new GraphQLClient(dexterSubgraphEndpoint);
  const results = await graphQLClient.request(currentTvlOp, {
    "vault": dexterVaultAddr,
    "date": dateStr
  });

  return results.tvl.aggregate.sum.liquidity;
}

async function tvl(timestamp) {
  const currentTVL = await getTvlAtTime(timestamp);

  // return the liquidity for prev day, if none exists for current day
  const liquidity = currentTVL ? currentTVL : await getTvlAtTime(timestamp - 86400);

  return toUSDTBalances(liquidity);
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  methodology: `Counts the liquidity on all AMM pools`,
  start: 1679788800, // "2023-03-26" UTC
  persistence: {
    tvl
  }
}; // node test.js projects/dexter/index.js
