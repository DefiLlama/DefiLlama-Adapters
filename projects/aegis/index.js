const sdk = require('@defillama/sdk')

const subgraphEndpoint = sdk.graph.modifyEndpoint('https://gateway.thegraph.com/api/[api-key]/subgraphs/id/EoCvJ5tyMLMJcTnLQwWpjAtPdn74PcrZgzfcT5bYxNBH')
const subgraphQuery = (blockNumber) => {
  return {
    query: `
      {
        pools(first: 1000, block: {number: ${blockNumber}}, where: { hooks: "0xa0b0d2d00fd544d8e0887f1a3cedd6e24baf10cc" }) {
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

async function getGraphBlock() {
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

module.exports.unichain = {
  tvl: async (api) => {
    const block = await api.getBlock(api.timestamp)
    const graphBlock = await getGraphBlock()

    const response = await fetch(subgraphEndpoint, {
      "body": JSON.stringify(subgraphQuery(block > graphBlock ? graphBlock : block)),
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

