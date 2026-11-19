const { function_view } = require("../helper/chain/aptos");

const meridianPackage = "fbdb3da73efcfa742d542f152d65fc6da7b55dee864cd66475213e4be18c9d54";

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

      for (const pool of pools) {
        const assets = await callPoolView('pool_assets_metadata', [pool.inner])
        const balances = await callPoolView('pool_balances', [pool.inner])
        api.addTokens(assets.map(i => i.inner), balances)
      }
    },
  },
};
