const { request, gql } = require("graphql-request");

const graphUrl = 'https://api.thegraph.com/subgraphs/name/morazzela/fortressalpha';
const graphQuery = gql`
    query {
        protocolMetrics
        (
            first: 1,
            orderBy: timestamp,
            orderDirection: desc
        )
        {
            totalValueLocked
        }
    }
`;

async function tvl() {
  const { protocolMetrics } = await request(
    graphUrl,
    graphQuery
  );

  return Number.parseFloat(protocolMetrics[0].totalValueLocked)
}

module.exports = {
    avalanche: { tvl },
    tvl
}