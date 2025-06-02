const sdk = require("@defillama/sdk");
const { request, gql } = require("graphql-request");
const { staking } = require("../helper/staking");

const CLAM = "0xC250e9987A032ACAC293d838726C511E6E1C029d";
const PearlBank = "0x845EB7730a8D37e8D190Fb8bb9c582038331B48a";

const endpoint = sdk.graph.modifyEndpoint('CejrrsnSQAxHJBpkgiBrLHQZ7h2MkK9QArM8bJvN9GuQ')

const query = gql`
  query tvl {
    protocolMetrics(
      first: 1
      orderBy: timestamp
      orderDirection: desc
    ) {
      treasuryMarketValue
      timestamp
    }
  }
`;

async function tvl(api) {
  const results = await request(endpoint, query)
  return api.addUSDValue(parseFloat(results.protocolMetrics[0].treasuryMarketValue))
}

module.exports = {
  deadFrom: '2024-08-14',
  methodology: "This adapter uses otterclam's subgraph to fetch tvl data.",
  polygon: {
    tvl,
    staking: staking(PearlBank, CLAM),
  },
  hallmarks: [
    [1641686400, "Pearl Chest launch"],
    [1657929600, "Staking v2 launch"],
  ],
};
