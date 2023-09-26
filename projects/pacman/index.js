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
      totalDeposit
      totalDebt
    }
  }
`;

async function tvl(timestamp, ethBlock, chainBlocks, { api }) {
  const { vaults } = await graphQuery(subgraphUrl, vaultsQuery)
  vaults.forEach(({ baseToken:  { id, decimals }, totalDebt, totalDeposit}) => {
    api.add(id, (totalDeposit - totalDebt) * ( 10 ** decimals))
  })
}

module.exports = {
  arbitrum: {
    tvl,
  }
}; 