const sdk = require('@defillama/sdk')

const graphIds = {
  base: 'Gqm2b5J85n1bhCyDMpGbtbVn4935EvvdyHdHrx3dibyj'
}

function uniV4HookExport({ hook }) {
  const query = `{
  
  pools (where:{
    hooks: "${hook.toLowerCase()}"
  }, orderBy:totalValueLockedUSD orderDirection:desc first: 999) {
        id
    token0 { symbol id  decimals }
    token1 { symbol id  decimals }
    totalValueLockedUSD
    totalValueLockedToken0
    totalValueLockedToken1
  }
}`
  return async (api) => {
    if (!hook) throw new Error('hook address is required')
    if (!graphIds[api.chain]) throw new Error(`Unsupported chain ${api.chain}`)
    const { pools } = await sdk.graph.request(graphIds[api.chain], query)
    pools.forEach(pool => {
      const token0 = pool.token0.id
      const token1 = pool.token1.id
      const balance0 = pool.totalValueLockedToken0 * (10 ** pool.token0.decimals)
      const balance1 = pool.totalValueLockedToken1 * (10 ** pool.token1.decimals)
      api.addToken(token0, balance0)
      api.addToken(token1, balance1)
    })
  }
}


module.exports = {
  uniV4HookExport,
}
