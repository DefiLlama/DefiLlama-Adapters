const sui = require("../helper/chain/sui");
const { cachedGraphQuery } = require('../helper/cache');

const graphQL_endpoint = "https://5lox8etck8.execute-api.eu-central-1.amazonaws.com/api/v1";
const GET_SUI_POOLS = `query GetSuiPools {
  getSuiPools {
    pools {
      poolId
    }
  }
}`

async function tvl(api) {
    const sui_pools = await cachedGraphQuery('degen-hive-sui-pools', graphQL_endpoint, GET_SUI_POOLS);
    const poolIds = sui_pools.getSuiPools.pools.map(pool => pool.poolId);
    const suiPoolsData = await sui.getObjects(poolIds);

    for (const { type, fields } of suiPoolsData) {
      if (fields.coin_x_reserve == 0 && fields.coin_y_reserve == 0) continue;
      let coin_x_type = type.split('<')[1].split(',')[0].trim();
      let coin_y_type = type.split('<')[1].split(',')[1].trim();
      
      api.add(coin_x_type, fields.coin_x_reserve);
      api.add(coin_y_type, fields.coin_y_reserve);

      if (fields.coin_z_reserve && fields.coin_z_reserve > 0) {
        let coin_z_type = type.split('<')[1].split(',')[2].trim();
        api.add(coin_z_type, fields.coin_z_reserve);
      }
    }
}

// Export first
module.exports = {
  timetravel: false,
  sui: {
    tvl,
  },
  methodology: "TVL consists of the liquidity in the DegenHive's AMM pools."
};