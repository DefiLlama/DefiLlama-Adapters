const { gql, request } = require("graphql-request");

/*
 TO TEST
node test.js projects/teller/index.js
*/

const pools_graph_config = {
  ethereum: 'https://subgraph.satsuma-prod.com/daba7a4f162f/teller--16564/tellerv2-pools-mainnet/version/0.4.21.6/api',
  base: 'https://subgraph.satsuma-prod.com/daba7a4f162f/teller--16564/tellerv2-pools-base/version/0.4.21.4/api', 
  arbitrum: 'https://subgraph.satsuma-prod.com/daba7a4f162f/teller--16564/tellerv2-pools-arbitrum/version/0.4.21.4/api' , 
  katana: 'https://api.goldsky.com/api/public/project_cme01oezy1dwd01um5nile55y/subgraphs/teller-pools-v2-katana/0.4.21.12/gn',
  hyperevm: 'https://api.goldsky.com/api/public/project_cme01oezy1dwd01um5nile55y/subgraphs/teller-pools-v2-hyperevm/0.4.21.11/gn'
}

const poolsGraphQuery = gql`
  {
    groupPoolMetrics(first: 1000) {
      id
      group_pool_address
      principal_token_address
      collateral_token_address
      total_principal_tokens_committed
      total_principal_tokens_withdrawn
      total_principal_tokens_borrowed
      total_principal_tokens_repaid
      
      total_collateral_tokens_deposited
      total_collateral_tokens_withdrawn
    }
  }
`





async function tvl(api) {
  const poolsGraphUrl = pools_graph_config[api.chain]

  const { groupPoolMetrics } = await request(poolsGraphUrl, poolsGraphQuery);

  // TVL = total_collateral_tokens_deposited - total_collateral_tokens_withdrawn
  groupPoolMetrics.forEach(pool => {
    const deposited = pool.total_collateral_tokens_deposited || '0'
    const withdrawn = pool.total_collateral_tokens_withdrawn || '0'
    const netCollateral = BigInt(deposited) - BigInt(withdrawn)
    if (netCollateral > 0n) {
      api.add(pool.collateral_token_address, netCollateral.toString())
    }
  })
}

async function borrowed(api) {
  const poolsGraphUrl = pools_graph_config[api.chain]

  const { groupPoolMetrics } = await request(poolsGraphUrl, poolsGraphQuery);

  // Borrowed = total_principal_tokens_borrowed - total_principal_tokens_repaid
  groupPoolMetrics.forEach(pool => {
    const borrowed = pool.total_principal_tokens_borrowed || '0'
    const repaid = pool.total_principal_tokens_repaid || '0'
    const netBorrowed = BigInt(borrowed) - BigInt(repaid)
    if (netBorrowed > 0n) {
      api.add(pool.principal_token_address, netBorrowed.toString())
    }
  })
}

const chains_config = ["ethereum","base","arbitrum","katana"] ;

chains_config.forEach(chain => {
  module.exports[chain] = { tvl, borrowed, }
})