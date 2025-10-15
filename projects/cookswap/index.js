// 使用 Subgraph 接口直接获取 USD 价格
async function tvl(api) {
  console.log('Using Subgraph USD values for TVL calculation')
  
  // 使用完整的 GraphQL 查询
  const query = `
    query PoolList(
      $first: Int = 100
      $skip: Int = 0
      $where: Pool_filter = {}
      $q: String = ""
      $orderBy: Pool_orderBy = totalValueLockedUSD
      $orderDirection: OrderDirection = desc
    ) {
      pools(
        first: $first
        skip: $skip
        orderBy: $orderBy
        orderDirection: $orderDirection
        where: {
          and: [
            $where
            {
              or: [
                { token0_: { name_contains_nocase: $q } }
                { token0_: { symbol_contains_nocase: $q } }
                { token1_: { name_contains_nocase: $q } }
                { token1_: { symbol_contains_nocase: $q } }
              ]
            }
          ]
        }
      ) {
        id
        token0 { id symbol name }
        token1 { id symbol name }
        feeTier
        totalValueLockedUSD
        hourData24h: poolHourData(first: 24, orderBy: periodStartUnix, orderDirection: desc) {
          periodStartUnix
          volumeUSD
          tvlUSD
        }
      }
    }
  `
  
  try {
    const response = await fetch('https://www.cookpump.ai/subgraphs/name/v3-juchain-subgraph', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        query,
        variables: {
          first: 100,
          skip: 0,
          orderBy: "totalValueLockedUSD",
          orderDirection: "desc",
          where: {},
          q: ""
        }
      })
    })
    
    const data = await response.json()
    const pools = data.data.pools
    let totalUSD = 0
    pools.forEach(pool => {
      const usdValue = parseFloat(pool.totalValueLockedUSD)
      totalUSD += usdValue
    })
    return {
      'tether': totalUSD
    }
    
  } catch (error) {
    return {}
  }
}


module.exports = {
  juchain: {
    tvl
  }
}

