const { GraphQLClient, gql } = require("graphql-request");
const ethers = require("ethers");

async function tvl() {
  var graphQLClient = new GraphQLClient(
    "https://api.studio.thegraph.com/query/70998/scoreplay-euro24/version/latest"
  );

  const getTotalTvl = gql`
    {
      tvlActivity(id: "0x01") {
        totalVolume
      }
    }
  `;
  const results = await graphQLClient.request(getTotalTvl);

  const totalVolume = parseFloat(
    ethers.formatEther(results.tvlActivity.totalVolume)
  );

  return {
    ethereum: totalVolume,
  };
}

module.exports = {
  methodology: "sums the eth balance in each team for LeagueFactory contract.",
  start: 15582196,
  base: { tvl },
};
