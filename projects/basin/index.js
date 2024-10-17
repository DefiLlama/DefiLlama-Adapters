const { gql, request } = require("graphql-request");

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

function chainTvl(chain) {
  return async (api) => {
    const wells = await request(chains[chain].subgraphUrl, gql`{
        wells {
          id
          tokens {
            id
          }
        }
      }`);
    const ownerTokens = wells.wells.map(well => [well.tokens.map(t => t.id), well.id]);
    return api.sumTokens({ ownerTokens });
  }
}

module.exports = {
  methodology: "Counts the value of token reserves inside all deployed Wells.",
  start: 1692797303,
  ethereum: {
    tvl: chainTvl('ethereum')
  },
  arbitrum: {
    tvl: chainTvl('arbitrum')
  }
};
