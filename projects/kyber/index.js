const sdk = require("@defillama/sdk");
const retry = require("async-retry");
const { GraphQLClient, gql } = require("graphql-request");
const { getChainTransform } = require("../helper/portedTokens");
const { calcTvl } = require("./tvl.js");
const { getBlock } = require("../helper/getBlock");
const abi = require("./abi.json");

const chains = {
  ethereum: {
    graphId: "mainnet",
    factory: "0x833e4083B7ae46CeA85695c4f7ed25CDAd8886dE"
  },
  arbitrum: {
    graphId: "arbitrum-one",
    factory: "0x51E8D106C646cA58Caf32A47812e95887C071a62"
  },
  polygon: {
    graphId: "matic",
    factory: "0x5F1fe642060B5B9658C15721Ea22E982643c095c"
  },
  avax: {
    graphId: "avalanche",
    factory: "0x10908C875D865C66f271F5d3949848971c9595C9"
  },
  bsc: {
    graphId: "bsc",
    factory: "0x878dFE971d44e9122048308301F540910Bbd934c"
  },
  fantom: {
    graphId: "fantom",
    factory: "0x78df70615ffc8066cc0887917f2Cd72092C86409"
  },
  cronos: {
    graphId: "cronos",
    factory: "0xD9bfE9979e9CA4b2fe84bA5d4Cf963bBcB376974"
  },
  optimism: {
    graphId: "optimism",
    factory: "0x1c758aF0688502e49140230F6b0EBd376d429be5"
  },
  aurora: { factory: "0xD9bfE9979e9CA4b2fe84bA5d4Cf963bBcB376974" },
  //velas: { factory: "0xD9bfE9979e9CA4b2fe84bA5d4Cf963bBcB376974" },
  oasis: { factory: "0xD9bfE9979e9CA4b2fe84bA5d4Cf963bBcB376974" }
  //bittorrent: { factory: "0xD9bfE9979e9CA4b2fe84bA5d4Cf963bBcB376974" }
};

async function fetchPools(chain) {
  const url =
    chain == "cronos"
      ? "https://cronos-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-elastic-cronos"
      : `https://api.thegraph.com/subgraphs/name/kybernetwork/kyberswap-elastic-${chain}`;
  const graphQLClient = new GraphQLClient(url);

  return (await retry(
    async bail =>
      await graphQLClient.request(gql`
        {
          pools {
            id
          }
        }
      `)
  )).pools.map(p => p.id);
}
function elastic(chain) {
  return async (_, block, chainBlocks) => {
    if (!("graphId" in chains[chain])) return {};

    block = chainBlocks[chain];
    const pools = await fetchPools(chains[chain].graphId);
    const balances = {};
    const transform = await getChainTransform(chain);

    const [{ output: token0s }, { output: token1s }] = await Promise.all([
      sdk.api.abi.multiCall({
        calls: pools.map(p => ({
          target: p
        })),
        block,
        chain,
        abi: abi.token0
      }),
      sdk.api.abi.multiCall({
        calls: pools.map(p => ({
          target: p
        })),
        block,
        chain,
        abi: abi.token1
      })
    ]);
    const [token0Balances, token1Balances] = await Promise.all([
      sdk.api.abi.multiCall({
        calls: pools.map((p, i) => ({
          target: token0s[i].output,
          params: [p]
        })),
        block,
        chain,
        abi: "erc20:balanceOf"
      }),
      sdk.api.abi.multiCall({
        calls: pools.map((p, i) => ({
          target: token1s[i].output,
          params: [p]
        })),
        block,
        chain,
        abi: "erc20:balanceOf"
      })
    ]);

    sdk.util.sumMultiBalanceOf(balances, token0Balances, true, transform);
    sdk.util.sumMultiBalanceOf(balances, token1Balances, true, transform);

    return balances;
  };
}
function classic(chain) {
  return async (timestamp, block, chainBlocks) => {
    if (!("factory" in chains[chain])) return {};
    const transform = await getChainTransform(chain);
    return calcTvl(
      transform,
      getBlock(timestamp, chain, chainBlocks),
      chain,
      chains[chain].factory,
      0,
      true
    );
  };
}

const moduleExports = {};
Object.keys(chains).forEach(chain => {
  moduleExports[chain] = {
    tvl: sdk.util.sumChainTvls([elastic(chain), classic(chain)])
  };
});
module.exports = {
  misrepresentedTokens: true,
  ...moduleExports
};
