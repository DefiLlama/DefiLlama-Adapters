const { nullAddress } = require("../helper/tokenMapping");
const { get } = require("../helper/http");

const INFINITY_POOL_CONTRACT = "0x43dAe5624445e7679D16a63211c5ff368681500c"; // pool address
const totalAssetsABI = "function totalAssets() view returns (uint256)";
const totalBorrowedABI = "function totalBorrowed() view returns (uint256)";

module.exports = {
  methodology:
    "The GLIF Pools protocol is a liquid staking protocol for Filecoin that requires borrowers to collateralize FIL in order to borrow for their storage providing operation. This TVL calculation adds the total amount of FIL staked into the protocol, and the total amount of locked FIL collateral by borrowers, to arrive at TVL.",
  filecoin: {
    tvl: async (_, _1, _2, { api }) => {
      const [totalAssets, totalLockedByMiners] = await Promise.all([
        api.call({ abi: totalAssetsABI, target: INFINITY_POOL_CONTRACT }),
        // this call is too costly to perform on chain in this environment,
        // we wrapped the locked miners collateral in a server that derives the information directly on-chain
        // but serves it in a more efficient manner to not overload defillama frontend
        // github repo: https://github.com/glifio/pools-metrics
        get("https://events.glif.link/metrics"),
      ]);

      const totalAssetsBN = +totalAssets
      const totalLockedByMinersBN = +totalLockedByMiners.totalMinerCollaterals
      // then we add the totalLockedByMiners to the totalAssets, to account for the FIL locked by miners as borrow collateral
      // this gets our tvl in attoFIL (wei denominated) without double counting
      api.add(nullAddress, totalAssetsBN+totalLockedByMinersBN);
    },
  },
};
