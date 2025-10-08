const { gql, request } = require("graphql-request");
 
const { cachedGraphQuery } = require('../helper/cache')

const sdk = require('@defillama/sdk')




/*
 TO TEST
node test.js projects/teller/index.js
*/

const teller_graph_config = {

  ethereum:  sdk.graph.modifyEndpoint('https://gateway.thegraph.com/api/[api-key]/subgraphs/id/4JruhWH1ZdwvUuMg2xCmtnZQYYHvmEq6cmTcZkpM6pW'),
  base:  sdk.graph.modifyEndpoint('https://gateway.thegraph.com/api/[api-key]/subgraphs/id/8jSq7mzq9HEiJEcAZfvrTT4wYk59oMxm82xUpcVBzryF'),
  arbitrum:  sdk.graph.modifyEndpoint('https://gateway.thegraph.com/api/[api-key]/subgraphs/id/F2Cgx4q4ATiopuZ13nr1EMKmZXwfAdevF3EujqfayK7a'),
  katana:  sdk.graph.modifyEndpoint('https://gateway.thegraph.com/api/[api-key]/subgraphs/id/CfcwmqFDd425rEFQVFk52tJmquETeBiUCmK7kv2DHkPs'),


}


const tellerGraphQuery = gql`
 {
    tokenVolumes (orderBy: totalActive, orderDirection: desc ){
      id
      token {
        id
        address
        symbol
        decimals
      }
      collateralToken {
        id
        address
        symbol
        decimals
      }
      totalAvailable,
      outstandingCapital,
      totalLoaned
      totalActive
      totalAccepted
    }
}
`

const bidCollateralQuery = gql`
  query ($skip: Int!) {
    bidCollaterals(first: 1000, skip: $skip, where: { status: "Deposited" }) {
      id
      amount
      collateralAddress
      token {
        address
        symbol
        decimals
      }
      bid {
        status
      }
    }
  }
`





const pools_graph_config = {
  ethereum: 'https://subgraph.satsuma-prod.com/daba7a4f162f/teller--16564/tellerv2-pools-mainnet/version/0.4.21.6/api',
  base: 'https://subgraph.satsuma-prod.com/daba7a4f162f/teller--16564/tellerv2-pools-base/version/0.4.21.4/api', 
  arbitrum: 'https://subgraph.satsuma-prod.com/daba7a4f162f/teller--16564/tellerv2-pools-arbitrum/version/0.4.21.4/api' , 
}


const pools_v2_graph_config = {
  ethereum: 'https://subgraph.satsuma-prod.com/daba7a4f162f/teller--16564/tellerv2-poolsv2-mainnet/version/0.4.21.5/api',
  base: 'https://subgraph.satsuma-prod.com/daba7a4f162f/teller--16564/tellerv2-poolsv2-base/version/0.4.21.5/api', 
  arbitrum: 'https://subgraph.satsuma-prod.com/daba7a4f162f/teller--16564/tellerv2-poolsv2-arbitrum/version/0.4.21.5/api' , 
  katana: 'https://api.goldsky.com/api/public/project_cme01oezy1dwd01um5nile55y/subgraphs/teller-pools-v2-katana/0.4.21.12/gn',
//   hyperevm: 'https://api.goldsky.com/api/public/project_cme01oezy1dwd01um5nile55y/subgraphs/teller-pools-v2-hyperevm/0.4.21.11/gn'
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
      total_interest_collected
      token_difference_from_liquidations
      total_collateral_tokens_deposited
      total_collateral_tokens_withdrawn
    }
  }
`



async function bidCollateralTvl(api) {

    const tellerGraphUrl = teller_graph_config[api.chain]

    // Fetch all BidCollateral entries with status "Deposited" and active bids
    let allCollaterals = []
    let skip = 0
    const pageSize = 1000

    while (true) {
      const data = await request(tellerGraphUrl, bidCollateralQuery, { skip })
      if (!data.bidCollaterals || data.bidCollaterals.length === 0) break

      allCollaterals = allCollaterals.concat(data.bidCollaterals)

      if (data.bidCollaterals.length < pageSize) break
      skip += pageSize
    }

    // Filter for active loans only (status: Accepted)
    const activeCollaterals = allCollaterals.filter(c => c.bid.status === 'Accepted')

    // Sum collateral by token
    activeCollaterals.forEach(collateral => {
      api.add(collateral.token.address, collateral.amount)
    })


}

async function poolsLenderTvl( api ) {

  let allPools = []

  // Fetch from v1 pools if available
  if (pools_graph_config[api.chain]) {
    const { groupPoolMetrics } = await request(pools_graph_config[api.chain], poolsGraphQuery);
    allPools = allPools.concat(groupPoolMetrics)
  }

  // Fetch from v2 pools if available
  if (pools_v2_graph_config[api.chain]) {
    const { groupPoolMetrics } = await request(pools_v2_graph_config[api.chain], poolsGraphQuery);
    allPools = allPools.concat(groupPoolMetrics)
  }

  allPools.forEach(pool => {
    const totalInterestCollected = BigInt(pool.total_interest_collected || '0')
    const tokenDifferenceFromLiquidations = BigInt(pool.token_difference_from_liquidations || '0')
    const totalCollateralEscrowedNet = BigInt(pool.total_collateral_tokens_deposited || '0') - BigInt(pool.total_collateral_tokens_withdrawn || '0')

    const totalTokensActivelyBorrowed = BigInt(pool.total_principal_tokens_borrowed || '0') - BigInt(pool.total_principal_tokens_repaid || '0')
    const totalTokensActivelyCommitted =
      BigInt(pool.total_principal_tokens_committed || '0') +
      totalInterestCollected +
      tokenDifferenceFromLiquidations -
      BigInt(pool.total_principal_tokens_withdrawn || '0')

    // Add collateral TVL 
  //  if (totalCollateralEscrowedNet > 0n) {
   //   api.add(pool.collateral_token_address, totalCollateralEscrowedNet.toString())
   // }

    // Add net principal TVL (committed - borrowed)
    const netPrincipalTvl = totalTokensActivelyCommitted - totalTokensActivelyBorrowed
    if (netPrincipalTvl > 0n) {
      api.add(pool.principal_token_address, netPrincipalTvl.toString())
    }
  })


}



async function tvl(api) {


  //add OG collateral data

    await bidCollateralTvl ( api )

    await poolsLenderTvl( api)


}

async function borrowed(api) {
  let allPools = []

  // Fetch from v1 pools if available
  if (pools_graph_config[api.chain]) {
    const { groupPoolMetrics } = await request(pools_graph_config[api.chain], poolsGraphQuery);
    allPools = allPools.concat(groupPoolMetrics)
  }

  // Fetch from v2 pools if available
  if (pools_v2_graph_config[api.chain]) {
    const { groupPoolMetrics } = await request(pools_v2_graph_config[api.chain], poolsGraphQuery);
    allPools = allPools.concat(groupPoolMetrics)
  }

  // Borrowed = total_principal_tokens_borrowed - total_principal_tokens_repaid
  allPools.forEach(pool => {
    const borrowed = pool.total_principal_tokens_borrowed || '0'
    const repaid = pool.total_principal_tokens_repaid || '0'
    const netBorrowed = BigInt(borrowed) - BigInt(repaid)
    if (netBorrowed > 0n) {
      api.add(pool.principal_token_address, netBorrowed.toString())
    }
  })
}

// All chains that have either v1 or v2 pools
const allChains = ["ethereum", "base", "arbitrum", "katana" ]

allChains.forEach(chain => {
  module.exports[chain] = { tvl, borrowed }
})