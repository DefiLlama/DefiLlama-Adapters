const { sumTokens } = require("../helper/unwrapLPs");
const { GraphQLClient, gql } = require("graphql-request");
const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const contracts = {
  euler: "0x27182842E098f60e3D576794A5bFFb0777E025d3",
  markets: "0xE5d0A7A3ad358792Ba037cB6eE375FfDe7Ba2Cd1",
  markets_proxy: "0x3520d5a913427E6F0D6A83E07ccD4A4da316e4d3",
  eulerSimpleLens: "0x5077B7642abF198b4a5b7C4BdCE4f03016C7089C",
};

// Graphql endpoint to query markets
const graphql_url =
  "https://api.thegraph.com/subgraphs/name/euler-xyz/euler-mainnet";

const markets_query = gql`
  query {
    eulerMarketStores {
      markets(orderBy: totalBalancesUsd, orderDirection:desc) {
        id
        totalBorrows
      }
    }
  }
`;

const graphQLClient = new GraphQLClient(graphql_url);

async function getMarkets() {
  const markets = await graphQLClient.request(markets_query);
  return markets.eulerMarketStores[0].markets;
}

async function tvlEthereum(timestamp, ethBlock) {
  const markets = await getMarkets();
  // const markets_underlyings = markets.map((market) => market.id);

  // // use markets_underlyings or markets_underlyings_nographql
  // const tokensAndOwners = markets_underlyings.map((underlying) => [
  //   underlying,
  //   contracts.euler,
  // ]);
  // return sumTokens({}, tokensAndOwners, ethBlock);
  const tvl = {};
  const call = (
    await sdk.api.abi.multiCall({
      abi: abi.getTotalSupplyAndDebts,
      calls: markets.map((p) => ({
        target: contracts.eulerSimpleLens,
        params: p.id,
      })),
      block: ethBlock
    })
  ).output;
  for (const i in call) {
    if (!call[i].success) continue;
    tvl[call[i].input.params[0]] = call[i].output[0];
  }
  return tvl;
}

async function borrowedEthereum(timestamp, ethBlock) {
  const borrowed = {};
  const markets = await getMarkets();
  // markets.forEach((market) => {
  //   borrowed[market.id] = market.totalBorrows;
  // });
  const call = (
    await sdk.api.abi.multiCall({
      abi: abi.getTotalSupplyAndDebts,
      calls: markets.map((p) => ({
        target: contracts.eulerSimpleLens,
        params: p.id,
      })),
      block: ethBlock
    })
  ).output;
  for (const i in call) {
    if (!call[i].success) continue;
    borrowed[call[i].input.params[0]] = call[i].output[2];
  }
  delete borrowed["0x31c8eacbffdd875c74b94b077895bd78cf1e64a3"]
  return borrowed;
}

module.exports = {
  hallmarks: [[1654387200, "Whale Deposit"]],
  methodology: `TVL is supply balance minus borrows the euler contract. Borrows are pulled from the subgraph.`,
  ethereum: {
    tvl: tvlEthereum,
    borrowed: borrowedEthereum,
    // staking: staking(EULstaking, EUL),
  },
};
