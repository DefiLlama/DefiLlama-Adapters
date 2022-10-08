// const { ApiPromise, WsProvider } = require("@polkadot/api");

// const SDN_DECIMALS = 18;

// async function tvl() {
//   const provider = new WsProvider("wss://rpc.shiden.astar.network");
//   const api = new ApiPromise({
//     provider,
//   });

//   await api.isReady;
//   const era = await api.query.dappsStaking.currentEra();
//   const result = await api.query.dappsStaking.generalEraInfo(era);
//   const tvl = result.unwrap().locked;
//   const SDNLocked = tvl / 10 ** SDN_DECIMALS;

//   return {
//     shiden: SDNLocked,
//   };
// }

// module.exports = {
//   methodology:
//     "TVL considers SDN tokens deposited to the Dapps-Staking program",
//   shiden: {
//     tvl,
//   },
// };

// This has been delisted

module.exports = {
  shiden: {
    tvl: () => ({})
  }
}
