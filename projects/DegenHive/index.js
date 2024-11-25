const sui = require("../helper/chain/sui");
const { GraphQLClient } = require("graphql-request");
  
const graphQLClientMainnet = new GraphQLClient(
    "https://5lox8etck8.execute-api.eu-central-1.amazonaws.com/api/v1"
  );

const GET_SUI_POOLS = `query GetSuiPools {
  getSuiPools {
    pools {
      poolId
    }
  }
}`

const GET_SUI_MEME_POOLS = `query GetSuiMemePools {
  getSuiMemePools {
    pools {
      meme_pool_addr
    }
  }
}`

 

async function tvl(api) {
    const sui_pools = await graphQLClientMainnet.request(GET_SUI_POOLS, {})
    const sui_meme_pools = await graphQLClientMainnet.request(GET_SUI_MEME_POOLS, {})

    // Extract arrays of pool IDs
    const poolIds = sui_pools.getSuiPools.pools.map(pool => pool.poolId);
    const memePoolAddrs = sui_meme_pools.getSuiMemePools.pools.map(pool => pool.meme_pool_addr);

    const suiPoolsData = await sui.getObjects(poolIds)
    const suiMemePoolsData = await sui.getObjects(memePoolAddrs)

    // Add TVL for AMM Pools 
    for (const { type, fields } of suiPoolsData) {
        if ( fields.coin_x_reserve == 0 && fields.coin_y_reserve == 0) continue;
        let coin_x_type = type.split('<')[1].split(',')[0].trim()
        let coin_y_type = type.split('<')[1].split(',')[1].trim()
        
        api.add(  coin_x_type, fields.coin_x_reserve )
        api.add( coin_y_type, fields.coin_y_reserve )

        if (fields.coin_z_reserve && fields.coin_z_reserve > 0) {
            let coin_z_type = type.split('<')[1].split(',')[2].trim()
            api.add( coin_z_type, fields.coin_z_reserve )
        }
    }

    // Add TVL for MEME Pools 
    for (const { fields } of suiMemePoolsData) {
        if ( fields.sui_available == 0) continue;
        api.add( "0x2::sui::SUI", fields.sui_available) 
    }

    // Add TVL from SUI liquid staking
    const dsui_vault = await sui.getObject("0x85aaf87a770b4a09822e7ca3de7f9424a4f58688cfa120f55b294a98d599d402");
    let sui_staked = dsui_vault.fields.dsui_supply * dsui_vault.fields.sui_claimable_per_dsui / 1e9 + dsui_vault.fields.sui_to_stake;

    api.add( "0x2::sui::SUI", sui_staked) 

}

// Add a mock api for local testing
class MockApi {
    constructor() {
      this.balances = {};
    }
  
    add(token, amount) {
      if (!this.balances[token]) this.balances[token] = 0;
      this.balances[token] += amount;
    }
  }
  

// Add this section for local testing
if (require.main === module) {
    const mockApi = new MockApi();
    tvl(mockApi)
      .then(result =>{ console.log('TVL calculation completed:', result); console.log(mockApi.balances)})
      .catch(error => console.error('TVL calculation failed:', error));
  }
   
module.exports = {
  timetravel: false,
  sui: {
    tvl,
  },
  methodology: "TVL consists of the liquidity in the AMM pools, SUI present in Meme coin launchpad pools, and the SUI staked in the liquid staking pools."
};