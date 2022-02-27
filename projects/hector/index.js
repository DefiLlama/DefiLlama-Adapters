const { GraphQLClient, gql } = require("graphql-request");
const retry = require("async-retry");
const { getBlock } = require("../helper/getBlock");
const sdk = require("@defillama/sdk");
const erc20 = require("../helper/abis/erc20.json");

const hectorStakingv1 = "0x9ae7972BA46933B3B20aaE7Acbf6C311847aCA40";
const hectorStakingv2 = "0xD12930C8deeDafD788F437879cbA1Ad1E3908Cc5";
const hec = "0x5C4FDfc5233f935f20D2aDbA572F770c2E377Ab0";

const HectorStakings = [
  // V1
  hectorStakingv1,
  // V2
  hectorStakingv2,
];

async function treasury() {
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
  return +results.protocolMetrics[0].treasuryMarketValue;
}
async function treasuryInvestments() {
  var endpoint =
    "https://api.thegraph.com/subgraphs/name/hectordao-hec/hector-dao";
  var graphQLClient = new GraphQLClient(endpoint);

  var query = gql`
    query {
      protocolMetrics(first: 1, orderBy: timestamp, orderDirection: desc) {
        treasuryInvestments
      }
    }
  `;
  const results = await retry(
    async (bail) => await graphQLClient.request(query)
  );
  return +results.protocolMetrics[0].treasuryInvestments;
}
async function bank() {
  var endpoint =
    "https://api.thegraph.com/subgraphs/name/hectordao-hec/hector-dao";
  var graphQLClient = new GraphQLClient(endpoint);

  var query = gql`
    query {
      protocolMetrics(first: 1, orderBy: timestamp, orderDirection: desc) {
        bankBorrowed
        bankSupplied
      }
    }
  `;
  const results = await retry(
    async (bail) => await graphQLClient.request(query)
  );
  const bankTotal =
    +results.protocolMetrics[0].bankBorrowed +
    +results.protocolMetrics[0].bankSupplied;
  return bankTotal;
}
async function torCurveLP() {
  var endpoint =
    "https://api.thegraph.com/subgraphs/name/hectordao-hec/hector-dao";
  var graphQLClient = new GraphQLClient(endpoint);

  var query = gql`
    query {
      tors(first: 1, orderBy: timestamp, orderDirection: desc) {
        torTVL
      }
    }
  `;
  const results = await retry(
    async (bail) => await graphQLClient.request(query)
  );

  return +results.tors[0].torTVL;
}
async function eth() {
  var endpoint =
    "https://api.thegraph.com/subgraphs/name/hectordao-hec/hector-eth";
  var graphQLClient = new GraphQLClient(endpoint);

  var query = gql`
    query {
      ethMetrics(first: 1, orderBy: timestamp, orderDirection: desc) {
        treasuryBaseRewardPool
      }
    }
  `;
  const results = await retry(
    async (bail) => await graphQLClient.request(query)
  );

  return +results.ethMetrics[0].treasuryBaseRewardPool;
}

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

async function fetch() {
  return (await treasury()) + (await eth());
}

module.exports = {
  fantom: {
    staking,
  },
  bank: {
    fetch: bank,
  },
  torCurveLP: {
    fetch: torCurveLP,
  },
  curve: {
    fetch: async () => (await eth()) + (await treasuryInvestments()),
  },
  fetch,
};
