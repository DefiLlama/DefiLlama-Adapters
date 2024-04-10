const { request, gql } = require("graphql-request");
const { getBlock } = require('../helper/http')

const graphUrls = {
  ethereum: 'https://api.thegraph.com/subgraphs/name/salgozino/klerosboard',
  xdai: 'https://api.thegraph.com/subgraphs/name/salgozino/klerosboard-xdai',
}

const totalStakedQuery = gql`
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

    const { klerosCounters } = await request(
      graphUrl,
      totalStakedQuery,
      { block: block - 500 }
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
