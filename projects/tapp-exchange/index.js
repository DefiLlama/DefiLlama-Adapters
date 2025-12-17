const { function_view } = require("../helper/chain/aptos");
const { sleep } = require("../helper/utils");

const MODULE_VIEW = "0xf5840b576a3a6a42464814bc32ae1160c50456fb885c62be389b817e75b2a385";

async function getPools(offset, limit) {
  return await function_view({
    functionStr: `${MODULE_VIEW}::tapp_views::get_pool_metas_paginated`,
    args: [0, offset, limit],
    type_arguments: [],
  });
}

async function getPairedCoin(address) {
  const result = await function_view({
    functionStr: "0x1::coin::paired_coin",
    args: [address],
    type_arguments: [],
  });

  const [coinInfo] = result.vec || [];

  if (!coinInfo) return null;

  const { account_address, module_name, struct_name } = coinInfo;

  const module = Buffer.from(module_name.replace(/^0x/, ""), "hex").toString(
    "utf-8"
  );
  const struct = Buffer.from(struct_name.replace(/^0x/, ""), "hex").toString(
    "utf-8"
  );

  return `${account_address}::${module}::${struct}`;
}

module.exports = {
  methodology:
    "Measures the total liquidity across all pools on TAPP Exchange.",
  timetravel: false,
  aptos: {
    tvl: async (api) => {
      const hookTypes = [2, 3, 4];
      let allPools = [];
      let offset = "0";
      const limit = "200";
      let hasMore = true;

      // Fetch all pools using pagination
      while (hasMore) {
        const pools = await getPools(offset, limit);
        if (pools.length === 0) {
          hasMore = false;
        } else {
          allPools = allPools.concat(pools);
          offset = (parseInt(offset) + pools.length).toString();
          // If we got fewer pools than the limit, we've reached the end
          if (pools.length < parseInt(limit)) {
            hasMore = false;
          }
        }
      }

      // Filter pools by hook types
      const filteredPools = allPools.filter((pool) =>
        hookTypes.includes(pool.hook_type)
      );

      for (const pool of filteredPools) {
        // loop coins
        for (let i = 0; i < pool.assets.length; i++) {
          const coin = pool.assets[i];
          const pairedCoin = await getPairedCoin(coin) || coin;
          if (pairedCoin) {
            api.add(pairedCoin, pool.reserves[i]);
          }
          // Add small delay to avoid rate limiting
          await sleep(200);
        }
      }
    },
  },
};
