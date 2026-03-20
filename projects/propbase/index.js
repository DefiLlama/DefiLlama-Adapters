const ADDRESSES = require('../helper/coreAssets.json')
const { function_view } = require('../helper/chain/aptos');
const { getConfig } = require("../helper/cache");

const PROPS_FA = "0x6dba1728c73363be1bdd4d504844c40fbb893e368ccbeff1d1bd83497dbc756d";
const USDC_FA = ADDRESSES.aptos.USDC_3;

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: `TVL includes USDC tokens deposited in Nova pools (RWA) and Rental pools. 
  RWA assets are paired with USDC in on - chain liquidity pools built on Trader Joe’s CLMM contracts,
  which allows users to buy and sell property tokens directly against USDC.
  Redemption is AMM- based and depends on pool liquidity and active price bins,
  not a guaranteed 1: 1 stablecoin redemption.PROPS tokens are reported separately under staking.`,

  aptos: {
    tvl: async (api) => {
      const chain = "aptos";
      const data = await getConfig('propbase/config', `https://contractaddress.propbase.app/production`);

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

      // ---- RWA assets current values in USDC ---
      for (const pool of data.RWA_POOLS) {
        const saleConfig = await function_view({
          functionStr: `${pool.assetAddress}::nexus_primary_market::get_sale_config`,
          type_arguments: [],
          args: [],
          chain,
        });

        const totalPurchasedToken = saleConfig.length > 8 ? Number(saleConfig[8]) / 1e8 : 0;
        let valueInUsd = 0;

        if (pool.poolAddress) {
          const poolConfig = await function_view({
            functionStr: `${pool.poolAddress}::nova_pool::get_pool_config`,
            type_arguments: [],
            args: [],
            chain,
          });

          const activeBinId = poolConfig.length > 6 ? poolConfig[6] : 0;

          const price = await function_view({
            functionStr: `${pool.poolAddress}::nova_pool::get_price_from_bin_id`,
            type_arguments: [],
            args: [activeBinId],
            chain,
          });

          valueInUsd += totalPurchasedToken * Number(price);
        } else {
          const salePrice = saleConfig.length > 2 ? Number(saleConfig[2]) : 0;
          valueInUsd += totalPurchasedToken * salePrice;
        }

        api.addTokens(USDC_FA, valueInUsd);
      }
    },

    staking: async (api) => {
      const chain = "aptos";
      const data = await getConfig('propbase/config', `https://contractaddress.propbase.app/production`);

      for (const pool of data.STAKING_POOLS) {
        const fa_balance = await function_view({
          functionStr: `0x1::primary_fungible_store::balance`,
          type_arguments: ["0x1::fungible_asset::Metadata"],
          args: [pool, PROPS_FA],
          chain,
        });

        api.addTokens(PROPS_FA, fa_balance);
      }
    },
  },
};
