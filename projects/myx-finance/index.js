const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require("../helper/balances");
const { default: BigNumber } = require("bignumber.js");


const config = {
  arbitrum: { subgraphUrl: "https://subgraph-arb.myx.finance/subgraphs/name/myx-subgraph" },
  linea: { subgraphUrl: "https://subgraph-linea.myx.finance/subgraphs/name/myx-subgraph" },
};

async function getTvl() {
  const { api } = arguments[3];
  const { subgraphUrl } = config[api.chain];

  const tokensIdResult = await request(subgraphUrl, gql`
    query MyQuery {
      tokens {
        id
      }
    }
  `)


  const tokensDataResult = await Promise.all(tokensIdResult.tokens.map(async (token) => {
    const query = `
      query MyQuery {
        token(id: "${token.id}") {
          decimals
          id
          name
          symbol
          totalValueLocked
          totalValueLockedUSD
          volume
          volumeUSD
        }
      }
    `

    return await request(subgraphUrl, gql`${query}`)
  }))

  const tvl = tokensDataResult.reduce((acc, item) => {
    return acc.plus(item.token.totalValueLockedUSD)
  }, new BigNumber(0))

  return toUSDTBalances(tvl.toFixed())
}

module.exports = {
  misrepresentedTokens: false,
  timetravel: true,
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl: getTvl };
});
