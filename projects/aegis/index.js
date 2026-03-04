const sdk = require('@defillama/sdk')

const subgraphEndpointUnichain = sdk.graph.modifyEndpoint('https://gateway.thegraph.com/api/[api-key]/subgraphs/id/EoCvJ5tyMLMJcTnLQwWpjAtPdn74PcrZgzfcT5bYxNBH')
const subgraphEndpointBase = sdk.graph.modifyEndpoint('https://gateway.thegraph.com/api/[api-key]/subgraphs/id/Gqm2b5J85n1bhCyDMpGbtbVn4935EvvdyHdHrx3dibyj')
const hookAddressUnichain = "0xa0b0d2d00fd544d8e0887f1a3cedd6e24baf10cc".toLowerCase();
const hookAddressBase = "0x88c9ff9fc0b22cca42265d3f1d1c2c39e41cdacc".toLowerCase();
const subgraphQuery = (blockNumber, hookAddress) => {
  return {
    query: `
      {
        pools(first: 1000, block: {number: ${blockNumber}}, where: { hooks: "${hookAddress}" }) {
          token0 {
            id
            decimals
          }
          token1 {
            id
            decimals
          }
          totalValueLockedToken0
          totalValueLockedToken1
        }    
      }

    `
  }
};

async function getGraphBlock(subgraphEndpoint) {
  const query = {
    query: `
      {
        _meta {
          block {
            number
          }
        }
      }
    `
  }
  const response = await fetch(subgraphEndpoint, {
    "body": JSON.stringify(query),
    "method": "POST"
  })
  const data = await response.json()

  return Number(data.data._meta.block.number)
}

module.exports.base = {
  tvl: async (api) => {
    const block = await api.getBlock(api.timestamp)
    const graphBlock = await getGraphBlock(subgraphEndpointBase)

    const response = await fetch(subgraphEndpointBase, {
      "body": JSON.stringify(subgraphQuery(block > graphBlock ? graphBlock : block, hookAddressBase)),
      "method": "POST"
    })
    const data = await response.json()
    for (const pool of data.data.pools) {
      api.add(pool.token0.id, Number(pool.totalValueLockedToken0) * (10**Number(pool.token0.decimals)))
      api.add(pool.token1.id, Number(pool.totalValueLockedToken1) * (10**Number(pool.token1.decimals)))
    }
  },
}
module.exports.unichain = {
  tvl: async (api) => {
    const block = await api.getBlock(api.timestamp)
    const graphBlock = await getGraphBlock(subgraphEndpointUnichain)

    const response = await fetch(subgraphEndpointUnichain, {
      "body": JSON.stringify(subgraphQuery(block > graphBlock ? graphBlock : block, hookAddressUnichain)),
      "method": "POST"
    })
    const data = await response.json()
    for (const pool of data.data.pools) {
      api.add(pool.token0.id, Number(pool.totalValueLockedToken0) * (10**Number(pool.token0.decimals)))
      api.add(pool.token1.id, Number(pool.totalValueLockedToken1) * (10**Number(pool.token1.decimals)))
    }
  },
}

module.exports.doublecounted = true
module.exports.methodology = 'Count total assets are deposited in Aegis hooks on Uniswap v4 using subgraph provided by Aegis.'

