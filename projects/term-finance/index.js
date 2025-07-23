const { cachedGraphQuery, graphFetchById } = require('../helper/cache')
const { sumTokens2 } = require('../helper/unwrapLPs');

const graphs = {
  ethereum:
    "https://api.mainnet.termfinance.io/mainnet/subgraph/term",
  avax:
    "https://api.mainnet.termfinance.io/avalanche/subgraph/term",
  base:
    "https://api.mainnet.termfinance.io/base/subgraph/term",
  arbitrum:
    "https://api.mainnet.termfinance.io/arbitrum/subgraph/term",
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
query borrowedQuery($lastId: ID, $block: Int) {
  termRepoExposures(
    where: {
      repoExposure_gt: 0,
      id_gt: $lastId,
    },
    first: 1000,
    block: {
      number: $block
    }
  ) {
    id
    term {
      purchaseToken
    }
    repoExposure
  }
}`

const borrowedQueryHeadBlock = `
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

const graphStartBlock = {
  ethereum: 5240462,
  avax: 43162227,
  base: 30797402,
  arbitrum: 359134348,
}

module.exports = {
  methodology: `Counts the collateral tokens locked in Term Finance's term repos and purchase tokens locked in Term Finance's vaults.`,
  // hallmarks: [[1588610042, "TermFinance Launch"]],
};

Object.keys(graphs).forEach(chain => {
  const host = graphs[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      // Auctions/Repos TVL
      const data = await cachedGraphQuery(`term-finance-${chain}`, host, query, { fetchById: true })
      return sumTokens2({ api, tokensAndOwners: data.map(i => [i.collateralToken, i.term.termRepoLocker]), permitFailure: true })
    },
    borrowed: async (api) => {
      let data
      if (!api.block) {
        data = await graphFetchById({ endpoint: host, query: borrowedQueryHeadBlock, api, useBlock: false })
      } else if (api.block >= graphStartBlock[chain]) {
        data = await graphFetchById({ endpoint: host, query: borrowedQuery, api, useBlock: true, params: { block: api.block } })
      } else {
        data = []
      }

      for (const { term: { purchaseToken }, repoExposure } of data) {
        api.add(purchaseToken, repoExposure)
      }

      return api.getBalances()
    }
  }
})
