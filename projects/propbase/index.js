const ADDRESSES = require('../helper/coreAssets.json')
const { function_view, sumTokens } = require('../helper/chain/aptos');
const { getConfig } = require("../helper/cache");

const PROPS_FA = "0x6dba1728c73363be1bdd4d504844c40fbb893e368ccbeff1d1bd83497dbc756d";
const PROPS_COIN = "0xe50684a338db732d8fb8a3ac71c4b8633878bd0193bca5de2ebc852a83b35099::propbase_coin::PROPS";
const USDC_FA = ADDRESSES.aptos.USDC_3;

const getData = () => getConfig('propbase/config', `https://contractaddress.propbase.app/production`)

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
      const data = await getData();

      // --- RWA (Nova) and Rental pools hold plain USDC: one indexer query covers every pool ---
      api.addBalances(await sumTokens({ api, owners: [...data.NOVA_POOLS, ...data.RENTAL_POOLS], tokens: [USDC_FA] }))

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
      const data = await getData();
      // staking pools hold PROPS: one indexer query instead of one balance view per pool.
      // PROPS is a coin-paired FA, which the indexer reports under the coin type
      const balances = await sumTokens({ api, owners: data.STAKING_POOLS, tokens: [PROPS_COIN] })
      api.add(PROPS_FA, balances[`aptos:${PROPS_COIN}`] ?? 0)
    },
  },
};
