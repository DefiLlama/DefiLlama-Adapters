const { cachedGraphQuery, graphFetchById } = require('../helper/cache')
const { sumTokens2 } = require('../helper/unwrapLPs');

const graphs = {
  ethereum:
    "https://graphql-gateway-term.mainnet.mainnet.termfinance.io/graphql",
  avax:
    "https://graphql-gateway-term.avalanche.mainnet.termfinance.io/graphql",
};

const query = `
query poolQuery($lastId: ID) {
  termRepoCollaterals(
    first: 1000,
    where: {
      id_gt: $lastId,
      term_: { delisted: false }
    }
  ) {
    id
    term { termRepoLocker }
    collateralToken
  }
}`

const borrowedQuery = `
query borrowedQuery($lastId: ID) {
  termRepoExposures(
    where: {
      repoExposure_gt: 0,
      id_gt: $lastId,
    },
    first: 1000
  ) {
    id
    term {
      purchaseToken
    }
    repoExposure
  }
}`

module.exports = {
  methodology: `Counts the collateral tokens locked in Term Finance's term repos.`,
  // hallmarks: [[1588610042, "TermFinance Launch"]],
};

Object.keys(graphs).forEach(chain => {
  const host = graphs[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const data = await cachedGraphQuery(`term-finance-${chain}`, host, query, { fetchById: true })
      return sumTokens2({ api, tokensAndOwners: data.map(i => [i.collateralToken, i.term.termRepoLocker]), permitFailure: true })
    },
    borrowed: async (api) => {
      const data = await graphFetchById({ endpoint: host, query: borrowedQuery, api })

      for (const { term: { purchaseToken }, repoExposure } of data) {
        api.add(purchaseToken, repoExposure)
      }

      return api.getBalances()
    }
  }
})
