// canister h6uvl-xiaaa-aaaap-qaawa-cai has had its wasm module uninstalled, so the /tvl endpoint no longer exists
module.exports = {
  deadFrom: '2026-10-07',  // abandoned?
  timetravel: false,
  methodology: "TVL counts ICP deposited as collateral to mint stICP",
  icp: {
    tvl: () => ({}),
  },
};
