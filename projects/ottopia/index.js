const retry = require("async-retry");
const { GraphQLClient, gql } = require("graphql-request");
const { staking } = require("../helper/staking");

const CLAM = "0xC250e9987A032ACAC293d838726C511E6E1C029d";
const PearlBank = "0x845EB7730a8D37e8D190Fb8bb9c582038331B48a";

async function tvl(timestamp, block, chainBlocks) {
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
        totalValueLocked
        treasuryMarketValue
        timestamp
      }
    }
  `;
  const results = await retry(
    async (bail) =>
      await graphQLClient.request(query, {
        start: timestamp - 86439,
        end: timestamp,
      })
  );
  return {
    usd: parseFloat(results.protocolMetrics[0].treasuryMarketValue),
  };
}

module.exports = {
  timetravel: true,
  methodology: "This adopter uses otterclam's subgraph to fetch tvl data.",
  start: 30711580,
  polygon: {
    tvl,
    staking: staking(PearlBank, CLAM, "polygon"),
  },
};
