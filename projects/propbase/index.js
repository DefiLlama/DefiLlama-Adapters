const axios = require("axios");
const { function_view } = require('../helper/chain/aptos');

const PROPS_FA = "0x6dba1728c73363be1bdd4d504844c40fbb893e368ccbeff1d1bd83497dbc756d";
const USDC_FA = "0xbae207659db88bea0cbead6da0ed00aac12edcdda169e591cd41c94180b46f3b";


module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology:
    "TVL includes USDC tokens deposited in Nova pools (RWA) and PROPS tokens staked in staking pools.",

  aptos: {
    tvl: async (api) => {
      const chain = "aptos";
  const { data } = await axios.get(`https://contractaddress.propbase.app/production`);

      // --- RWA Pools (USDC) ---
      for (const pool of data.NOVA_POOLS) {
        const fa_balance = await function_view({
          functionStr: `0x1::primary_fungible_store::balance`,
          type_arguments: ["0x1::fungible_asset::Metadata"],
          args: [pool, USDC_FA],
          chain,
        });

        api.addTokens(USDC_FA, fa_balance);
      }

      // --- Staking Pools (PROPS) ---
      for (const pool of data.STAKING_POOLS) {
        const fa_balance = await function_view({
          functionStr: `0x1::primary_fungible_store::balance`,
          type_arguments: ["0x1::fungible_asset::Metadata"],
          args: [pool, PROPS_FA],
          chain,
        });
        api.addTokens(PROPS_FA, fa_balance);
      }

      // --- Rental Pools (USDC) ---
      for (const pool of data.RENTAL_POOLS) {
        const fa_balance = await function_view({
          functionStr: `0x1::primary_fungible_store::balance`,
          type_arguments: ["0x1::fungible_asset::Metadata"],
          args: [pool, USDC_FA],
          chain,
        });
        api.addTokens(USDC_FA, fa_balance);
      }

      // ----RWA assets current values in USDC---
      for (const pool of data.RWA_POOLS) {
        try {
          // Fetch sale config from asset address
          const saleConfig = await function_view({
            functionStr: `${pool.assetAddress}::nexus_primary_market::get_sale_config`,
            type_arguments: [],
            args: [],
            chain,
          });

          const totalPurchasedToken = saleConfig.length > 8 ? Number(saleConfig[8]) / 1e8 : 0;
          let valueInUsd = 0;
          if(pool.poolAddress){
          // Fetch active bin ID from pool
          const poolConfig = await function_view({
            functionStr: `${pool.poolAddress}::nova_pool::get_pool_config`,
            type_arguments: [],
            args: [],
            chain,
          });


          const activeBinId = poolConfig.length > 6 ? poolConfig[6] : 0;


          // Fetch price from bin ID
          const price = await function_view({
            functionStr: `${pool.poolAddress}::nova_pool::get_price_from_bin_id`,
            type_arguments: [],
            args: [activeBinId],
            chain,
          });
          valueInUsd += totalPurchasedToken * Number(price);
        } else {
          const salePrice = saleConfig.length > 2 ? Number(saleConfig[2])  : 0;


              // Total value = purchase quantity * price (adjusted)
              const valueUsd = totalPurchasedToken * salePrice;
              valueInUsd += valueUsd;
         
        }
          api.addTokens(USDC_FA, valueInUsd);


        } catch (err) {
          console.log(err);
        }
      }
    }
  },
};
