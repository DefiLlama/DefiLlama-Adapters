const { GraphQLClient, gql } = require("graphql-request");
const retry = require('../helper/retry')
const sdk = require("@defillama/sdk")
const { usdtAddress } = require('../helper/balances')
const { convertBalances, } = require('../helper/tezos')
const { getFixBalances } = require('../helper/portedTokens')
const { PromisePool } = require('@supercharge/promise-pool');
const { default: BigNumber } = require("bignumber.js");
const indexer = "https://mainnet-api.yupana.finance/v1/graphql";
const graphQLClient = new GraphQLClient(indexer);
const YUPANA_CORE = "KT1Rk86CX85DjBKmuyBhrCyNsHyudHVtASec";

const tvl_query = gql`
  {
    tvl: asset {
      contractAddress
      isFa2
      tokenId
      tokens {
        name
        decimals
      }
      totalLiquid
      totalBorrowed
      reserves
    }
  }
`;

const borrows_query = `
{
  borrows: asset {
    contractAddress
    isFa2
    tokenId
    tokens {
      name
      decimals
    }
    totalBorrowed
  }
}`;


async function tvl() {
  const balances = {};
  const fixBalances = await getFixBalances("tezos");
  const tvl_by_markets = await retry(
    async (req) => await graphQLClient.request(tvl_query)
  );
  tvl_by_markets.tvl.forEach(entry => {
    const underlying = entry.tokens[0];
    const token_tvl = new BigNumber(entry.totalLiquid)
      .plus(entry.totalBorrowed)
      .plus(entry.reserves)
      .div(10 ** 18);
    if (underlying.name.includes("XTZ")) {
      sdk.util.sumSingleBalance(balances, "tezos", +token_tvl.div(10**6).toFixed(18));
    } else sdk.util.sumSingleBalance(
      balances,
      entry.contractAddress + (entry.isFa2 ? "-" + entry.tokenId : ""),
      +token_tvl.toFixed(18)
    );
  });
  return fixBalances(await convertBalances(balances));
}

async function borrowed() {
  const balances = {};
  const fixBalances = await getFixBalances("tezos");
  const borrows_by_markets = await retry(
    async (req) => await graphQLClient.request(borrows_query)
  );
  borrows_by_markets.borrows.forEach((entry) => {
    const underlying = entry.tokens[0];
    const token_borrows = new BigNumber(entry.totalBorrowed)
      .div(10 ** 18);
    if (underlying.name.includes("XTZ")) {
      sdk.util.sumSingleBalance(
        balances,
        "tezos",
        +token_borrows.div(10 ** 6).toFixed(18)
      );
    } else
      sdk.util.sumSingleBalance(
        balances,
        entry.contractAddress + (entry.isFa2 ? "-" + entry.tokenId : ""),
        +token_borrows.toFixed(18)
      );
  });

  return fixBalances(await convertBalances(balances));
}

module.exports = {
  timetravel: false,
  tezos: {
    tvl,
    borrowed,
  },
  methodology:
    'TVL counts the liquidity, reserves and borrows for each market.',
};
