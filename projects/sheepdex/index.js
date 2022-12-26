const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { GraphQLClient, gql } = require("graphql-request");
const { sumTokens2 } = require('../helper/unwrapLPs')

const SpeFactory = "0x571521f8c16f3c4eD5f2490f19187bA7A5A3CBDf";
const SPC = "0x6a428ff9bfec2c8f676b8c905d49146c6106af90";

const bscTvl = async (_, _b, { bsc: block }) => {
  const chain = 'bsc'
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
    await graphQLClient.request(query)
  ).pools.map((pool) => pool.id);
  const { output: token0s } = await sdk.api.abi.multiCall({
    abi: abi.token0,
    calls: pools.map(i => ({ target: i})),
    chain, block,
  })
  const { output: token1s } = await sdk.api.abi.multiCall({
    abi: abi.token1,
    calls: pools.map(i => ({ target: i})),
    chain, block,
  })
  const toa = []
  token0s.forEach((_, i) => {
    toa.push([token0s[i].output, pools[i]])
    toa.push([token1s[i].output, pools[i]])
  })
  return sumTokens2({ chain, block, tokensAndOwners: toa, })
};

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: bscTvl,
  },
  methodology:
    "Counts liquidity on the AMM Pools, pulling data from the chart -> https://info.sheepdex.org/#/",
};
