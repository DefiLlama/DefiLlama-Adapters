const { graphQuery } = require('../helper/http')

const subgraphUrl = "https://api.thegraph.com/subgraphs/name/pacmanfinance/pacman-arbitrum";

const vaultsQuery = `
  query {
    vaults {
      baseToken {
        id
        priceByUsd
        decimals
      }
      id
      availableAmount
    }
  }
`;

async function tvl(timestamp, ethBlock, chainBlocks, { api }) {
  const { vaults } = await graphQuery(subgraphUrl, vaultsQuery)
  vaults.forEach(({ baseToken:  { id, decimals }, availableAmount}) => {
    api.add(id, availableAmount * ( 10 ** decimals))
  })
}

module.exports = {
  arbitrum: {
    tvl,
  }
}; 