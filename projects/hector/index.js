const { GraphQLClient, gql } = require("graphql-request");
const retry = require("async-retry");
const { getBlock } = require("../helper/getBlock");
const sdk = require("@defillama/sdk");
const erc20 = require("../helper/abis/erc20.json");

async function fetch() {
  var endpoint =
    "https://api.thegraph.com/subgraphs/name/hectordao-hec/hector-dao";
  var graphQLClient = new GraphQLClient(endpoint);

  var query = gql`
    query {
      protocolMetrics(first: 1, orderBy: timestamp, orderDirection: desc) {
        treasuryMarketValue
      }
    }
  `;
  const results = await retry(
    async (bail) => await graphQLClient.request(query)
  );
  return results.protocolMetrics[0].treasuryMarketValue;
}
const hectorStakingv1 = "0x9ae7972BA46933B3B20aaE7Acbf6C311847aCA40";
const hectorStakingv2 = "0xD12930C8deeDafD788F437879cbA1Ad1E3908Cc5";
const hec = "0x5C4FDfc5233f935f20D2aDbA572F770c2E377Ab0";

const HectorStakings = [
  // V1
  hectorStakingv1,
  // V2
  hectorStakingv2,
];
const staking = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};
  const chain = "fantom";
  let stakingBalance,
    totalBalance = 0;
  const block = await getBlock(timestamp, chain, chainBlocks);
  for (const stakings of HectorStakings) {
    stakingBalance = await sdk.api.abi.call({
      abi: erc20.balanceOf,
      target: hec,
      params: stakings,
      chain: chain,
      block: block,
    });
    totalBalance += Number(stakingBalance.output);
  }
  const address = `${chain}:${hec}`;

  return {
    [address]: totalBalance,
  };
};

module.exports = {
  fantom: {
    staking,
  },
  fetch,
};
