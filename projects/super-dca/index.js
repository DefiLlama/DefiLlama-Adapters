const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { request, gql } = require('graphql-request')
const sdk = require('@defillama/sdk')

// Chain-specific configuration
const CONFIG = {
  optimism: {
    STATE_VIEW: '0xc18a3169788f4f75a170290584eca6395c75ecdb',
    POSM: '0x3C3Ea4B57a46241e54610e5f022E5c45859A1017',
    FROM_BLOCK: 130947675,
    SUBGRAPH_ID: '6RBtsmGUYfeLeZsYyxyKSUiaA6WpuC69shMEQ1Cfuj9u',
    WHITELISTED_TOKENS: [
      ADDRESSES.optimism.USDC_CIRCLE, // USDC
      ADDRESSES.null, // WETH
      ADDRESSES.optimism.WBTC,  // WBTC
      ADDRESSES.optimism.OP // OP
    ],
    POOL_IDS: [
      // List of pools with the Super DCA Hook: 0xb4f4Ad63BCc0102B10e6227236e569Dce0d97A80
      '0x13b95815697f696c74bd1e7959d692d74476ec851b32be72e027cda8e9d05e35', // USDC-DCA
      '0x7e9d1e1966665cfdaadcdef03caaf3099e18447bd45b3af8b04a9844e3882863', // ETH-DCA
      '0x46224636f9ee95d76f57ec559b0099db863747ca5ac11e4db5b178b6ae269404', // WBTC-DCA
      // List of pools with the Super DCA Hook: 0x7098Bf7DFF80532aa6bbDB52DF4Ac4992Bec3A80
      '0xfaf4de6b4f92e8c44735d8224ceb89f54b7e6d9137ad7fac238057f09db75964', // USDC-DCA
      '0x8b3156a785bcf477d92f2f2a9d7827585d9d551525abb512b0769fbec34e9d22', // ETH-DCA
      '0x4dca8e9159ff294dd7a384ce446721719b491d5075b3bee9c57f6899043562c9', // WBTC-DCA
      '0xd6821af358d804a37fd82b956d80b2fcf74e6463069e7d8b2ffe86138087da36' // OP-DCA
    ]
  },
  base: {
    STATE_VIEW: '0xA3c0c9b65baD0b08107Aa264b0f3dB444b867A71',
    POSM: '0x7C5f5A4bBd8fD63184577525326123B519429bDc',
    FROM_BLOCK: 30838244,
    SUBGRAPH_ID: 'HNCFA9TyBqpo5qpe6QreQABAA1kV8g46mhkCcicu6v2R',
    WHITELISTED_TOKENS: [
      ADDRESSES.base.USDC, // USDC
      ADDRESSES.null, // WETH
      ADDRESSES.bsc.WBTC, // WBTC
      '0x63706e401c06ac8513145b7687A14804d17f814b'  // AAVE
    ],
    POOL_IDS: [
      // List of pools with the Super DCA Hook: 0xBc5F29A583a8d3ec76e03372659e01a22feE3A80
      '0x9f0b3075f99fd5270b45f1742f71fe08a33737d053e3aaa1eb4e19b1b94d516e', // ETH-DCA
      '0x870198ffb454503d5ce1b698c94bc98198c874d61e8a2994dd6e01ee04535f89', // USDC-DCA
      '0xca8fb98187ca61e9c2360a93d41cffa5ecd5b5911b3e705f6fbcdc08b42fe0db', // WBTC-DCA
      '0xc0ea512d5a20a822fcce987c10428d5b81d349bce55404456cbc6729eb0c3c6c' // AAVE-DCA
    ]
  }
}

const POSITIONS_QUERY = gql`
  query getPositions($poolId: String!) {
    transactions(
      where: {
        modifyLiquiditys_: { pool: $poolId }
        transfers_: { tokenId_gte: "0" }
      }
      orderBy: timestamp
      orderDirection: asc
      first: 1000
    ) {
      transfers(where: { tokenId_gte: "0" }) {
        tokenId
      }
    }
  }
`

// Get all position IDs for a specific poolId using subgraph
async function getAllPositionIdsForPool(api, poolId, config) {
  const subgraphEndpoint = sdk.graph.modifyEndpoint(config.SUBGRAPH_ID)
  const result = await request(subgraphEndpoint, POSITIONS_QUERY, { poolId })
  
  // Extract unique token IDs
  const tokenIdSet = new Set()
  result.transactions.forEach(tx => {
    tx.transfers.forEach(transfer => {
      tokenIdSet.add(transfer.tokenId)
    })
  })
  
  const uniqueTokenIds = Array.from(tokenIdSet)
  api.log(`Found ${uniqueTokenIds.length} unique position IDs for pool ${poolId}`)
  return uniqueTokenIds
}

function createTvlFunction(chain) {
  return async (api) => {
    const config = CONFIG[chain]
    if (!config) throw new Error(`Config not found for chain: ${chain}`)

    // api.log(`Using ${config.POOL_IDS.length} hardcoded pool IDs for ${chain}`)

    // Get all position IDs for all our pools
    const allPositionIds = []
    for (const poolId of config.POOL_IDS) {
      const positionIds = await getAllPositionIdsForPool(api, poolId, config)
      // api.log(`Pool ${poolId}: ${positionIds.length} positions`)
      allPositionIds.push(...positionIds)
    }

    // api.log(`Total positions found: ${allPositionIds.length}`)

    // Use the correct Uniswap v4 position resolver
    return sumTokens2({
      api,
      resolveUniV4: true,
      uniV4ExtraConfig: { 
        whitelistedTokens: config.WHITELISTED_TOKENS, // Only count non-DCA tokens
        positionIds: allPositionIds, 
      },
    })
  }
}

module.exports = {
  doublecounted: true,
  methodology: "The TVL is calculated by summing the value of tokens in Uniswap V4 liquidity pools that have the Super DCA Hook associated with them. The value represents the value of all non-DCA tokens (e.g., ETH, USDC, WBTC, AAVE, etc.) in these pools.",
  optimism: {
    tvl: createTvlFunction('optimism'),
  },
  base: {
    tvl: createTvlFunction('base'),
  }
}; 