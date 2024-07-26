const { sumTokensExport } = require('../helper/chain/cardano')

module.exports = {
  timetravel: false,
  cardano: {
    tvl: sumTokensExport({ scripts: ['111af84a9e697e1e7b042a0a06f061e88182feb9e9ada950b36a916bd55ea481523030b23a495286ca1a18bd141a493e9b5a19d889953f6cdb'] },), // 0x0f4b4f7f7e507f3b6e9e954d5f6f3f8f7fa06e0f
  }
}

/* 
// graph query for info
https://api.saturnswap.io/v1/graphql
query {
  pools(first: 1000, order: { pool_stats: { tvl: DESC } }) {
    edges {
      node {
        lp_fee_percent
        name
        pool_stats {
          tvl
          user_fees_earned_1d
          updated_at
          volume_1d
          reserve_token_two
          reserve_token_one
          price
        }
        token_project_one {
          asset_name
          id
          policy_id
          name
          ticker
          price
          decimals
        }
        token_project_one_id
        token_project_two {
          asset_name
          id
          policy_id
          name
          price
          decimals
          ticker
        }
      }
    }
  }
}
  
*/