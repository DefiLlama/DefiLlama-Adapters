
const subgraphEndpoint = 'https://api.goldsky.com/api/public/project_cm97dvfxxyivn01xe2sda93ka/subgraphs/angstrom-mainnet/1.3.3/gn'
const subgraphQuery = {
  query: `
    {
      pools(first: 1000) {
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
};

module.exports.ethereum = {
  tvl: async (api) => {
    const block = await api.getBlock(api.timestamp)

    const response = await fetch(subgraphEndpoint, {
      "body": JSON.stringify(subgraphQuery),
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
module.exports.methodology = 'Count total assets are deposited in Angstrom hooks on Uniswap v4 using subgraph provided by AngStrom.'
