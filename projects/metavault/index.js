const { GraphQLClient, gql } = require("graphql-request");
const retry = require("async-retry");
const { getBlock } = require("../helper/getBlock");
const sdk = require("@defillama/sdk");
const erc20 = require("../helper/abis/erc20.json");

async function fetch() {
  var endpoint =
    "https://api.thegraph.com/subgraphs/name/metavaultorg/metavault-subgraph";
  var graphQLClient = new GraphQLClient(endpoint);

  var query = gql`
    query {
      protocolMetrics(first: 1, orderBy: timestamp, orderDirection: desc) {
        treasuryMV
        totalValueLocked
      }
    }
  `;
  const results = await retry(
    async (bail) => await graphQLClient.request(query)
  );
  return results.protocolMetrics[0].totalValueLocked;
}

const stakingContract = "0x6eA8de8f643ba65D8be39bd8D3B72f6DaAda7E77";
const mvdContract = "0x27746007e821aeec6F9C65CBFda04870c236346c";

const Stakings = [stakingContract];
const staking = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};
  const chain = "fantom";
  let stakingBalance,
    totalBalance = 0;
  const block = await getBlock(timestamp, chain, chainBlocks);
  for (const stakings of Stakings) {
    stakingBalance = await sdk.api.abi.call({
      abi: erc20.balanceOf,
      target: mvdContract,
      params: stakings,
      chain: chain,
      block: block,
    });
    totalBalance += Number(stakingBalance.output);
  }
  const address = `${chain}:${mvdContract}`;

  return {
    [address]: totalBalance,
  };
};

module.exports = {
  fantom: {
    staking
  },
  fetch
};
