const sdk = require("@defillama/sdk");
const erc20 = require("../helper/abis/erc20.json");
const abi = require("./abi.json");
const retry = require("../helper/retry");
const { GraphQLClient, gql } = require("graphql-request");

const SpeFactory = "0x571521f8c16f3c4eD5f2490f19187bA7A5A3CBDf";
const SPC = "0x6a428ff9bfec2c8f676b8c905d49146c6106af90";

const bscTvl = async (chainBlocks) => {
  const balances = {};

  var endpoint = "https://api.thegraph.com/subgraphs/name/hfersss/sheepdexv1";
  var graphQLClient = new GraphQLClient(endpoint);

  var query = gql`
    {
      pools {
        id
      }
    }
  `;

  const pools = (
    await retry(async (bail) => await graphQLClient.request(query))
  ).pools.map((pool) => pool.id);

  for (const pool of pools) {
    const token0 = (
      await sdk.api.abi.call({
        abi: abi.token0,
        target: pool,
        chain: "bsc",
        block: chainBlocks["bsc"],
      })
    ).output;

    const token1 = (
      await sdk.api.abi.call({
        abi: abi.token1,
        target: pool,
        chain: "bsc",
        block: chainBlocks["bsc"],
      })
    ).output;

    const getToken0Balance = (
      await sdk.api.abi.call({
        abi: erc20.balanceOf,
        target: token0,
        params: pool,
        chain: "bsc",
        block: chainBlocks["bsc"],
      })
    ).output;

    const getToken1Balance = (
      await sdk.api.abi.call({
        abi: erc20.balanceOf,
        target: token1,
        params: pool,
        chain: "bsc",
        block: chainBlocks["bsc"],
      })
    ).output;

    sdk.util.sumSingleBalance(balances, `bsc:${token0}`, getToken0Balance);
    sdk.util.sumSingleBalance(balances, `bsc:${token1}`, getToken1Balance);
  }

  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: bscTvl,
  },
  methodology:
    "Counts liquidity on the AMM Pools, pulling data from the chart -> https://info.sheepdex.org/#/",
};
