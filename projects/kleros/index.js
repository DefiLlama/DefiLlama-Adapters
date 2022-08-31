const { request, gql } = require("graphql-request");

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
    const block = chainBlocks[chain]

    const {klerosCounters} = await request(
      graphUrl, 
      totalStakedQuery,
      {block}
    )

    balances.kleros = klerosCounters[0].tokenStaked / (10 ** 18);

    return balances;
  }
}


module.exports = {
  methodology: "Counts PNK staked in courts",
  timetravel: true,
  ethereum: {
    tvl: ()=>([]),
    staking: getStakedTvl('ethereum')
  },
  xdai: {
    tvl: ()=>([]),
    staking: getStakedTvl('xdai')
  },
}
