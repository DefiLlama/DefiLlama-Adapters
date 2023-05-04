const { stakings } = require("../helper/staking");
const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const UMAMI = "0x1622bf67e6e5747b81866fe0b85178a93c7f86e3";
// UMAMI staking for protocol revenue in WETH
const mUMAMI = "0x2adabd6e8ce3e82f52d9998a7f64a90d294a92a4";
// UMAMI staking from when it was still ohm fork with rebasing mechanics.
// There's still some staked tokens that are yet not unstaked and migrated.
const OHM_STAKING_sUMAMI = "0xc9ecFeF2fac1E38b951B8C5f59294a8366Dfbd81";
// glpUSDC vault is now deprecated
const glpUSDC = "0x2e2153fd13459eba1f277ab9acd624f045d676ce";
const glpInitBlock = 18703806;
const USDC = "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8";

module.exports = {
  doublecounted: true,
  timetravel: true,
  start: 1657027865, // UMAMI deployment block ts
  arbitrum: {
    staking: stakings([mUMAMI, OHM_STAKING_sUMAMI], UMAMI, "arbitrum"),
    tvl: async (_, _b, { arbitrum: block }) => {
      const balances = {};

      if (!block || block > glpInitBlock + 10) {
        const totalAssets = await sdk.api.abi.call({
          abi: abi.totalAssets,
          target: glpUSDC,
          chain: "arbitrum",
          block,
        });
        sdk.util.sumSingleBalance(
          balances,
          `arbitrum:${USDC}`,
          totalAssets.output
        );
      }

      return balances;
    },
  },
};
