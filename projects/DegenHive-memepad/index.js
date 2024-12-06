const sui = require("../helper/chain/sui");
const { cachedGraphQuery } = require('../helper/cache');
  
const graphQL_endpoint = "https://5lox8etck8.execute-api.eu-central-1.amazonaws.com/api/v1";
const GET_SUI_MEME_POOLS = `query GetSuiMemePools {
  getSuiMemePools {
    pools {
      meme_pool_addr
    }
  }
}`

 

async function tvl(api) {
    const sui_meme_pools = await cachedGraphQuery('degen-hive-sui-meme-pools', graphQL_endpoint, GET_SUI_MEME_POOLS);

    // Extract arrays of pool IDs
    const poolIds = sui_meme_pools.getSuiMemePools.pools.map(pool => pool.meme_pool_addr);
    const suiMemePoolsData = await sui.getObjects(poolIds)

    // Add TVL for MEME Pools 
    for (const { fields } of suiMemePoolsData) {
        if ( fields.sui_available == 0) continue;
        api.add( "0x2::sui::SUI", fields.sui_available) 
    }
}
 
module.exports = {
  timetravel: false,
  sui: {
    tvl,
  },
  methodology: "TVL consists of the liquidity in meme-coin launchpad pools."
};