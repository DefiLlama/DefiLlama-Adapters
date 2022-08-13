// const { ApiPromise, WsProvider } = require("@polkadot/api");

// const ASTR_DECIMALS = 18;

// async function tvl() {
//   const provider = new WsProvider("wss://astar.api.onfinality.io/public-ws");
//   const api = new ApiPromise({
//     provider,
//   });

//   await api.isReady;
//   const era = await api.query.dappsStaking.currentEra();
//   const result = await api.query.dappsStaking.generalEraInfo(era);
//   const tvl = result.unwrap().staked.valueOf();
//   const AstrLocked = tvl / 10 ** ASTR_DECIMALS;

//   return {
//     astar: AstrLocked,
//   };
// }

// module.exports = {
//   methodology:
//     "TVL considers ASTR tokens deposited to the Dapps-Staking program",
//   astar: { tvl },
// };

// This has been delisted

module.exports = {
  astar: {
    tvl: () => ({})
  }
}
