const { gql } = require("graphql-request");
const { request } = require("../helper/utils/graphql");

const GRAPHQL_ENDPOINT = 'https://graph.vet/subgraphs/name/vebetter/dao'
const B3TR_ADDRESS = '0x5ef79995fe8a89e0812330e4378eb2660cede699'

const tvlQuery = gql`
query TVL {
  rounds(
    orderBy: number
    orderDirection: desc
    where: {voteStart_gt: "0"}
    first: 1
  ) {
    number
    veDelegateStatistic {
      b3trExact
      vot3Exact
    }
  }
}
`;

module.exports = {
    timetravel: false,
    methodology: 'Sum of all B3TR deposited to veDelegate.vet',
    vechain: {
        tvl: async (api) => {

            // Get TVL from GraphQL subgraph
            try {
                const graphData = await request(GRAPHQL_ENDPOINT, tvlQuery);
                if (graphData && graphData.rounds && graphData.rounds.length > 0) {
                    const latestRound = graphData.rounds[0];
                    if (latestRound.veDelegateStatistic) {
                        const { b3trExact, vot3Exact } = latestRound.veDelegateStatistic;

                        // raw b3tr
                        api.add(B3TR_ADDRESS, b3trExact);

                        // b3tr that was wrapped with vot3
                        api.add(B3TR_ADDRESS, vot3Exact);
                    }
                }
            } catch (error) {
                console.error('Error fetching GraphQL data:', error);
            }
        }
    }
};