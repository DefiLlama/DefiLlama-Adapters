const { staking } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");

const stakingContract = "0x35cA0e02C4c16c94c4cC8B67D13d660b78414f95";
const NSDX = "0xE8d17b127BA8b9899a160D9a07b69bCa8E08bfc6";
const NSDX_USDC_UNIV2 = "0x56B8936a96cD5EE5C5837F385a19B4c2999fD74a";

module.exports = {
  misrepresentedTokens: true,
  staking: {
    tvl: staking(stakingContract, NSDX, "polygon"),
  },
  pool2: {
    tvl: pool2(stakingContract, NSDX_USDC_UNIV2, "polygon"),
  },
  tvl: async () => ({}),
  methodology:
    "We count liquidity on the Stake Seccion through Staking (MasterChef) Contract",
};
