const { request, gql } = require("graphql-request");
const { getUniqueAddresses } = require("../helper/utils");
const { sumTokens2 } = require("../helper/unwrapLPs");
const sdk = require("@defillama/sdk");

const addresses = {
  astar: {
    seanStaking: "0xa86dc743efBc24AF4c1FC5d150AaDb4DCF52c868",
    dotLiquidStaking: "0x5E60Af4d06A9fc89eb47B39b5fF1b1b42a19ef39",
    seanToken: "0xEe8138B3bd03905cF84aFE10cCD0dCcb820eE08E",
    dotToken: "0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF",
    liquidity: "0x496F6125E1cd31f268032bd4cfaA121D203639b7",
  },
};

const urls = {
  astar: {
    liquidityGraph:
      "https://api.subquery.network/sq/Starfish-Finance/starfish-finance",
  },
};

const liquidityAddressQuery = gql`
  {
    pools(first: 1000) {
      nodes {
        tokens(orderBy: ID_ASC) {
          nodes {
            address
          }
        }
      }
    }
  }
`;

const getLiquidityTokenAddresses = async (chain) => {
  const response = await request(
    urls[chain].liquidityGraph,
    liquidityAddressQuery
  );

  let tokenAddresses = [];
  for (let i = 0; i < response.pools.nodes.length; i++) {
    for (let address of response.pools.nodes[i].tokens.nodes) {
      tokenAddresses.push(address.address);
    }
  }
  return getUniqueAddresses(tokenAddresses);
};

const getLiquidityTvl = async (api) => {
  const tokenAddresses = await getLiquidityTokenAddresses(api.chain);
  return sumTokens2({
    api,
    tokens: tokenAddresses,
    owner: addresses[api.chain].liquidity,
  });
};

async function tvl(timestamp, ethBlock, chainBlocks, { api }) {
  return getLiquidityTvl(api);
}

const staking = async (timestamp, ethBlock, chainBlocks, { api }) => {
  const balances = {};

  const [seanStakingBalance, dotLiquidStakingBalance] = await Promise.all([
    sdk.api.abi.call({
      abi: "erc20:balanceOf",
      target: addresses.astar.seanToken,
      params: addresses.astar.seanStaking,
      chain: api.chain,
    }),
    sdk.api.abi.call({
      abi: "uint256:internalDotBalance",
      target: addresses.astar.dotLiquidStaking,
      chain: api.chain,
    }),
  ]);

  sdk.util.sumSingleBalance(
    balances,
    `${api.chain}:${addresses.astar.seanToken}`,
    seanStakingBalance.output
  );

  sdk.util.sumSingleBalance(
    balances,
    `${api.chain}:${addresses.astar.dotToken}`,
    dotLiquidStakingBalance.output
  );

  return balances;
};

module.exports = { tvl, staking };
