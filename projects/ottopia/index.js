const { GraphQLClient, gql } = require("graphql-request");
const { staking } = require("../helper/staking");

const CLAM = "0xC250e9987A032ACAC293d838726C511E6E1C029d";
const PearlBank = "0x845EB7730a8D37e8D190Fb8bb9c582038331B48a";

async function tvl({timestamp}, block, chainBlocks) {
  let endpoint = "https://api.thegraph.com/subgraphs/name/otterclam/otterclam";
  let graphQLClient = new GraphQLClient(endpoint);
  let query = gql`
    query tvl($start: BigInt!, $end: BigInt!) {
      protocolMetrics(
        where: { timestamp_gte: $start, timestamp_lt: $end }
        orderBy: timestamp
        orderDirection: desc
        first: 1
      ) {
        treasuryMarketValue
        timestamp
      }
    }
  `;
  const results = await  graphQLClient.request(query, {
        start: timestamp - 2 * 60 * 60 * 1000,
        end: timestamp,
      })
  return {
    usd: parseFloat(results.protocolMetrics[0].treasuryMarketValue),
  };
}

module.exports = {
    methodology: "This adapter uses otterclam's subgraph to fetch tvl data.",
  start: 30711580,
  polygon: {
    tvl,
    staking: staking(PearlBank, CLAM),
  },
  hallmarks: [
    [1641686400, "Pearl Chest launch"],
    [1657929600, "Staking v2 launch"],
  ],
};
