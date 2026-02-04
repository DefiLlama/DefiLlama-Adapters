const { cachedGraphQuery } = require('../helper/cache')

const vaultsGraphs = {
  ethereum:
    "https://api.subgraph.ormilabs.com/api/public/05e9a4e2-103b-4163-a81e-3b1b038d0055/subgraphs/term-finance-vaults-mainnet/latest/gn",
  avax:
    "https://api.subgraph.ormilabs.com/api/public/05e9a4e2-103b-4163-a81e-3b1b038d0055/subgraphs/term-finance-vaults-avalanche/latest/gn",
  base:
    "https://api.subgraph.ormilabs.com/api/public/05e9a4e2-103b-4163-a81e-3b1b038d0055/subgraphs/term-finance-vaults-base/latest/gn",
  bsc:
    "https://api.subgraph.ormilabs.com/api/public/05e9a4e2-103b-4163-a81e-3b1b038d0055/subgraphs/term-finance-vaults-bnb/latest/gn",
  arbitrum:
    "https://api.subgraph.ormilabs.com/api/public/05e9a4e2-103b-4163-a81e-3b1b038d0055/subgraphs/term-finance-vaults-arbitrum/latest/gn",
  plasma:
    "https://api.subgraph.ormilabs.com/api/public/05e9a4e2-103b-4163-a81e-3b1b038d0055/subgraphs/term-finance-vaults-plasma/latest/gn",
}

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

const vaultsGraphStartBlock = {
  ethereum: 21433264,
  avax: 54438973,
  base: 30797402,
  bsc: 54505207,
  arbitrum: 359134348,
  plasma: 1390659,
}

module.exports = {
  methodology: `Counts deposits in Term Strategy Vaults allocated to other protocols.`,
  // hallmarks: [[1588610042, "TermFinance Launch"]],
};

Object.keys(vaultsGraphs).forEach(chain => {
  const vaultsHost = vaultsGraphs[chain]
  module.exports[chain] = {
    tvl: async (api) => {
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

      return api.getBalances()
    },
  }
})
