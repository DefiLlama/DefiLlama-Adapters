  const { sumTokensExport } = require("../helper/unwrapLPs");
  const GFEX_POOL = "0x890bEe0Cf36A5d482c133e73Fe9d53B4aE7b52D4";
  const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

  module.exports = {
    methodology: "TVL is the USDC balance held in the GFEX prediction market pool contract, including active bets, rewardpot, and house pool.",
    base: {
      tvl: sumTokensExport({ owners: [GFEX_POOL], tokens: [USDC] }),
    },
  };
