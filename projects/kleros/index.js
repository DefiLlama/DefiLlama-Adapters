const sdk = require('@defillama/sdk')

const graphUrls = {
  ethereum: 'ECENsJRfqi6Mwj6kF9diShPzFKkgyyo79aSCkSwAShHL',
  xdai: 'Ck26N16xgimEuuuNSJqYVWBKcWSwPmkk36BWZGtfx1ox',
}

const totalStakedQuery = `
query($block: Int) {
  klerosCounters(block: { number: $block }) {
    tokenStaked
  }
}
`

function getStakedTvl(chain) {
  return async (api) => {
    const block = await api.getBlock()

    const { klerosCounters } = await sdk.graph.request(
      graphUrls[chain],
      totalStakedQuery,
      { variables: { block: block - 500 }}
    )

    return { kleros: klerosCounters[0].tokenStaked / (10 ** 18) }
  }
}


module.exports = {
  methodology: "Counts PNK staked in courts",
    ethereum: {
    tvl: () => ({}),
    staking: getStakedTvl('ethereum')
  },
  xdai: {
    tvl: () => ({}),
    staking: getStakedTvl('xdai')
  },
}
