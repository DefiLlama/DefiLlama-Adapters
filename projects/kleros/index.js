const { getBlock } = require('../helper/http')
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
  return async (timestamp, ethBlock, chainBlocks) => {
    const balances = {};

    const graphUrl = graphUrls[chain]
    const block = await getBlock(timestamp, chain, chainBlocks)

    const { klerosCounters } = await sdk.graph.request(
      graphUrl,
      totalStakedQuery,
      { variables: { block: block - 500 }}
    )

    balances.kleros = klerosCounters[0].tokenStaked / (10 ** 18);

    return balances;
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
