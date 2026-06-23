const { function_view } = require("../helper/chain/aptos");
const { sliceIntoChunks } = require("../helper/utils");

const meridianPackage = "fbdb3da73efcfa742d542f152d65fc6da7b55dee864cd66475213e4be18c9d54";
const POOL_BATCH_SIZE = 20;

function callPoolView(functionName, args = []) {
  return function_view({ functionStr: `${meridianPackage}::pool::${functionName}`, args, chain: 'move' });
}

module.exports = {
  timetravel: false,
  methodology:
    "Aggregates TVL in all pools in Meridian's AMM.",
  move: {
    tvl: async (api) => {
      const pools = await callPoolView('pools');

      for (const poolBatch of sliceIntoChunks(pools, POOL_BATCH_SIZE)) {
        await Promise.all(poolBatch.map(async (pool) => {
          const [assets, balances] = await Promise.all([
            callPoolView('pool_assets_metadata', [pool.inner]),
            callPoolView('pool_balances', [pool.inner]),
          ]);

          for (let i = 0; i < assets.length; i++) {
            api.add(assets[i].inner, balances[i]);
          }
        }));
      }
    },
  },
};
