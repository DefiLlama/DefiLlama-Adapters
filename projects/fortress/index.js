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
            ohmPrice,
            treasuryMarketValue,
            sOhmCirculatingSupply
        }
    }
`;

async function tvl() {
  const { protocolMetrics } = await request(
    graphUrl,
    graphQuery
  );

  return Number.parseFloat(protocolMetrics[0].treasuryMarketValue)
}

async function staking() {
    const { protocolMetrics } = await request(
      graphUrl,
      graphQuery
    );

    return Number.parseFloat(protocolMetrics[0].sOhmCirculatingSupply) * Number.parseFloat(protocolMetrics[0].ohmPrice);
}

module.exports = {
    avalanche: {
        tvl,
        staking
    },
    tvl,
    staking
}