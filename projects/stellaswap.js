const retry = require("./helper/retry");
const { GraphQLClient, gql } = require("graphql-request");
const BigNumber = require("bignumber.js");
const sdk = require("@defillama/sdk");
const { toUSDTBalances } = require("./helper/balances");

function getBalanceType(balance, swapId) {
  if (swapId == "0xb86271571c90ad4e0c9776228437340b42623402") {
    return {
      slug: "ethereum",
      value: new BigNumber(balance).div(10 ** 18).toFixed(0),
    };
  }
  return balance.length < 17
    ? {
        slug: "usd-coin",
        value: new BigNumber(balance).div(10 ** 6).toFixed(0),
      }
    : { slug: "dai", value: new BigNumber(balance).div(10 ** 18).toFixed(0) };
}

async function getXStellaTVL() {
  const endpoint =
    "https://api.thegraph.com/subgraphs/name/stellaswap/x-stella";
  const graphQLClient = new GraphQLClient(endpoint);

  const query = gql`
    {
      bars {
        totalSupply
      }
    }
  `;

  const results = await retry(
    async (bail) => await graphQLClient.request(query)
  );
  const balances = {};
  sdk.util.sumSingleBalance(
    balances,
    "stellaswap",
    (+results.bars[0].totalSupply).toFixed(0)
  );
  return balances;
}

async function getNormalALLTVL() {
  const endpoint =
    "https://api.thegraph.com/subgraphs/name/stellaswap/stella-swap";
  const graphQLClient = new GraphQLClient(endpoint);

  const query = gql`
    {
      uniswapFactories(first: 1) {
        totalLiquidityUSD
      }
    }
  `;

  const results = await retry(
    async (bail) => await graphQLClient.request(query)
  );
  return toUSDTBalances(results.uniswapFactories[0].totalLiquidityUSD);
}

async function getStableAmmTVL() {
  const endpoint =
    "https://api.thegraph.com/subgraphs/name/stellaswap/stable-amm";
  const graphQLClient = new GraphQLClient(endpoint);

  const query = gql`
    {
      swaps {
        id
        tokens {
          id
          symbol
          name
        }
        balances
      }
    }
  `;

  const results = await retry(
    async (bail) => await graphQLClient.request(query)
  );

  const balances = {};

  results.swaps.map((swap) => {
    swap.balances.map((b) => {
      const balanceType = getBalanceType(b, swap.id);
      sdk.util.sumSingleBalance(
        balances,
        balanceType.slug, // CG slug
        balanceType.value
      );
    });
  });
  return balances;
}

async function getTotalTvl() {
  const stableAmmTvl = await getStableAmmTVL();
  const normalAMMTvl = await getNormalALLTVL();
  const xStellaTvl = await getXStellaTVL();

  const commulative = { ...stableAmmTvl, ...normalAMMTvl, ...xStellaTvl };
  return commulative;
}
module.exports = {
  misrepresentedTokens: true,
  moonbeam: {
    tvl: getTotalTvl,
  },
};
