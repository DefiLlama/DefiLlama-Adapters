const { cachedGraphQuery, graphFetchById } = require('../helper/cache')
const { sumTokens2 } = require('../helper/unwrapLPs');
const { ethereum } = require('../helper/whitelistedNfts');

const graphs = {
  ethereum:
    "https://graphql-gateway-term.mainnet.mainnet.termfinance.io/graphql",
  avax:
    "https://graphql-gateway-term.avalanche.mainnet.termfinance.io/graphql",
};

const vaultsGraphs = {
  ethereum:
    "https://graphql-gateway-vaults.mainnet.mainnet.termfinance.io/graphql",
  avax:
    "https://graphql-gateway-vaults.avalanche.mainnet.termfinance.io/graphql",
}

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

const termVaultStrategiesQuery = `
query termVaultStrategiesQuery($lastId: ID, $block: Int) {
  termVaultStrategies(
    where: {
      id_gt: $lastId,
    },
    first: 1000,
    block: {
      number: $block
    }
  ) {
    id
    asset {
      id
    }
  }
}`

const termVaultStrategiesQueryHeadBlock = `
query termVaultStrategiesQuery($lastId: ID) {
  termVaultStrategies(
    where: {
      id_gt: $lastId,
    },
    first: 1000
  ) {
    id
    asset {
      id
    }
  }
}`

const graphStartBlock = {
  ethereum: 5240462,
  avax: 43162227,
}

const vaultsGraphStartBlock = {
  ethereum: 21433264,
  avax: 54438973,
}

module.exports = {
  methodology: `Counts the collateral tokens locked in Term Finance's term repos and purchase tokens locked in Term Finance's vaults.`,
  // hallmarks: [[1588610042, "TermFinance Launch"]],
};

Object.keys(graphs).forEach(chain => {
  const host = graphs[chain]
  const vaultsHost = vaultsGraphs[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      // Vaults TVL
      let vaultsData;
      if (!api.block) {
        vaultsData = await cachedGraphQuery(`term-finance-vaults-${chain}-head`, vaultsHost, termVaultStrategiesQueryHeadBlock, { fetchById: true, useBlock: false })
      } else if (api.block >= vaultsGraphStartBlock[chain]) {
        vaultsData = await cachedGraphQuery(`term-finance-vaults-${chain}`, vaultsHost, termVaultStrategiesQuery, { fetchById: true, useBlock: true, variables: { block: api.block } })
      } else {
        vaultsData = []
      }
      const strategyBalances = await api.multiCall({
        abi: 'uint256:totalLiquidBalance',
        calls: vaultsData.map(({ id }) => ({ target: id })),
        permitFailure: false,
      })
      vaultsData.forEach(({ asset: { id } }, i) => {
        api.add(id, strategyBalances[i])
      });

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
