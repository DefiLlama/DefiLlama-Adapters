const { sumTokensExport } = require("../helper/unwrapLPs");

const LSD_TOKENS = ['0xf40F19CAFaAA25bF9B52134646c6E325E76E0e93'];
const STAKING_POOL_ADDRESS = ['0x61CeC27ba136347ddA0AEDBe29a9b8219C32fF04'];

module.exports = {
  methodology: "TVL of Staked ETH & LSD tokens in the StakingPool contracts",
  arbitrum: {
    tvl: () => ({}),
    staking: sumTokensExport({ tokensAndOwners2: [LSD_TOKENS, STAKING_POOL_ADDRESS], }),
  },
};
