const { stakings } = require("../helper/staking");

const UMAMI = "0x1622bf67e6e5747b81866fe0b85178a93c7f86e3";
// UMAMI staking for protocol revenue in WETH
const mUMAMI = "0x2adabd6e8ce3e82f52d9998a7f64a90d294a92a4";
// UMAMI staking from when it was still ohm fork with rebasing mechanics.
// There's still some staked tokens that are yet not unstaked and migrated.
const OHM_STAKING_sUMAMI = "0xc9ecFeF2fac1E38b951B8C5f59294a8366Dfbd81";

module.exports = {
  timetravel: true,
  start: 1657027865, // UMAMI deployment block ts
  arbitrum: {
    staking: stakings([mUMAMI, OHM_STAKING_sUMAMI], UMAMI, "arbitrum"),
    tvl: (async) => ({}),
  },
};
