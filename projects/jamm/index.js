const { sumTokens2 } = require('../helper/unwrapLPs')

// 使用 Subgraph 接口直接获取 USD 价格
async function tvl(api) {
  console.log('Using Subgraph USD values for Jamm TVL calculation')

  // 使用 jamm 的 GraphQL 查询
  const query = `
    query AllPairs($first: Int!, $skip: Int!, $search: String) {
      pairs(
        first: $first
        skip: $skip
        where: {or: [{token0_: {symbol_contains_nocase: $search}}, {token1_: {symbol_contains_nocase: $search}}]}
        orderBy: reserveUSD
        orderBySecondary: id
        orderDirection: desc
      ) {
        id
        fee
        reserveUSD
        reserveETH
        yearApr0
        reserve0
        reserve1
        token0 {
          id
          name
          symbol
        }
        token1 {
          id
          name
          symbol
        }
        volumeUSD
        txCount
      }
    }
  `

  try {
    const response = await fetch('https://jamm.fun/api/graph', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operationName: "AllPairs",
        query,
        variables: {
          first: 100,
          skip: 0,
          search: ""
        }
      })
    })

    const data = await response.json()
    const pairs = data.data.pairs

    let totalUSD = 0
    pairs.forEach(pair => {
      const usdValue = parseFloat(pair.reserveUSD)
      totalUSD += usdValue
    })
    
    console.log(`Total TVL from Jamm Subgraph: ${totalUSD}`)
    return {
      'tether': totalUSD
    }

  } catch (error) {
    console.error('Error fetching from Jamm Subgraph:', error)
    return {}
  }
}

module.exports = {
  juchain: {
    tvl
  }
}
