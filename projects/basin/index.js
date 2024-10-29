const { cachedGraphQuery } = require('../helper/cache')
const chains = {
  ethereum: {
    startBlock: 17977905,
    subgraphUrl: "https://graph.bean.money/basin_eth"
  },
  arbitrum: {
    startBlock: 261772155,
    subgraphUrl: "https://graph.bean.money/basin"
  }
}

async function tvl(api) {
  const { subgraphUrl } = chains[api.chain];
  const wells = await cachedGraphQuery('basin/' + api.chain, subgraphUrl, `{
        wells {
          id tokens { id }
        }
      }`)
  const ownerTokens = wells.wells.map(well => [well.tokens.map(t => t.id), well.id]);
  return api.sumTokens({ ownerTokens });
}

module.exports = {
  methodology: "Counts the value of token reserves inside all deployed Wells.",
  start: 1692797303,
  ethereum: { tvl },
  arbitrum: { tvl }
};
