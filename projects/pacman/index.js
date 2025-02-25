const sdk = require("@defillama/sdk");
const { graphQuery } = require('../helper/http')

const subgraphUrl = sdk.graph.modifyEndpoint('9xteTELUdzjii1yLASJm6CxSpYuS1bmE6DGWMMhgkq2k');

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

async function tvl(api) {
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