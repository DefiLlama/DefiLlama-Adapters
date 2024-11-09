const { staking } = require("../helper/staking");

const stakingContract = "0xDa9A63D77406faa09d265413F4E128B54b5057e0";
const UMB = "0x6fC13EACE26590B80cCCAB1ba5d51890577D83B2";
const pool2StakingContract = "0x885EbCF6C2918BEE4A2591dce76da70e724f9a8E";
const UMB_WETH_UNIV2 = "0xB1BbeEa2dA2905E6B0A30203aEf55c399C53D042";


const stakingContract_bsc = "0x648F235ec0C24fe170BD0822d2FEf442880A25EE";
const UMB_bsc = "0x846F52020749715F02AEf25b5d1d65e48945649D";

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: (async) => ({}),
    staking: staking(stakingContract, UMB),
    pool2: staking(pool2StakingContract, UMB_WETH_UNIV2),
  },
  bsc: {
    staking: staking(stakingContract_bsc, UMB_bsc),
  },
  methodology: "Counts liquidty on the staking and pool2 only",
};
