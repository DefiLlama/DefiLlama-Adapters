const sdk = require("@defillama/sdk");
const { request, gql } = require("graphql-request");
const { getChainTransform } = require("../helper/portedTokens");
const { isWhitelistedToken } = require('../helper/streamingHelper')

const graphUrls = {
  ethereum:
    "https://api.thegraph.com/subgraphs/name/sushi-subgraphs/furo-ethereum",
  polygon:
    "https://api.thegraph.com/subgraphs/name/sushi-subgraphs/furo-polygon",
  fantom: "https://api.thegraph.com/subgraphs/name/sushi-subgraphs/furo-fantom",
  bsc: "https://api.thegraph.com/subgraphs/name/sushi-subgraphs/furo-bsc",
  avax: "https://api.thegraph.com/subgraphs/name/sushi-subgraphs/furo-avalanche",
  arbitrum:
    "https://api.thegraph.com/subgraphs/name/sushi-subgraphs/furo-arbitrum",
  optimism:
    "https://api.thegraph.com/subgraphs/name/sushi-subgraphs/furo-optimism",
  xdai: "https://api.thegraph.com/subgraphs/name/sushi-subgraphs/furo-gnosis",
  harmony:
    "https://api.thegraph.com/subgraphs/name/sushi-subgraphs/furo-harmony",
  moonbeam:
    "https://api.thegraph.com/subgraphs/name/sushi-subgraphs/furo-moonbeam",
  moonriver:
    "https://api.thegraph.com/subgraphs/name/sushi-subgraphs/furo-moonriver",
};

const bentoboxes = {
  ethereum: "0xF5BCE5077908a1b7370B9ae04AdC565EBd643966",
  polygon: "0x0319000133d3AdA02600f0875d2cf03D442C3367",
  fantom: "0xF5BCE5077908a1b7370B9ae04AdC565EBd643966",
  bsc: "0xF5BCE5077908a1b7370B9ae04AdC565EBd643966",
  avax: "0x0711b6026068f736bae6b213031fce978d48e026",
  arbitrum: "0x74c764D41B77DBbb4fe771daB1939B00b146894A",
  optimism: "0xc35DADB65012eC5796536bD9864eD8773aBc74C4",
  xdai: "0xE2d7F5dd869Fc7c126D21b13a9080e75a4bDb324",
  harmony: "0xA28cfF72b04f83A7E3f912e6ad34d5537708a2C2",
  moonbeam: "0x80C7DD17B01855a6D2347444a0FCC36136a314de",
  moonriver: "0x145d82bCa93cCa2AE057D1c6f26245d1b9522E6F",
};

const furoQuery = gql`
  query get_tokens($block: Int) {
    tokens(
      orderBy: liquidityShares
      orderDirection: desc
      first: 1000
      where: { liquidityShares_gt: 0 }
    ) {
      id
      liquidityShares
      symbol
      name
    }
  }
`;

const toAmountAbi = 'function toAmount(address token, uint256 share, bool roundUp) view returns (uint256 amount)'

function furo(chain, isVesting) {
  return async (timestamp, ethBlock, { [chain]: block}) => {
    const balances = {};
    const graphUrl = graphUrls[chain];
    const transform = await getChainTransform(chain);

    // Query graphql endpoint
    let { tokens } = await request(graphUrl, furoQuery, { block: block - 100, });

    tokens = tokens.filter(t => isWhitelistedToken(t.symbol, t.id, isVesting))
    const calls = tokens.map(token => ({ params: [token.id, token.liquidityShares, false] }))

    const { output } = await sdk.api.abi.multiCall({
      target: bentoboxes[chain],
      abi: toAmountAbi,
      calls,
      chain, block,
    })

    output.forEach(({ output: amount, input: { params: [token] } }) => sdk.util.sumSingleBalance(balances, transform(token), amount))
    return balances;
  };
}

module.exports = {
  furo,
  methodology: `TVL of Furo consists of tokens deployed into a Stream or a Vesting sitting in BentoBox.`,
};
