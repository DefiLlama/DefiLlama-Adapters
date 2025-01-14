const { queryContract } = require("../helper/chain/cosmos");
const ADDRESSES = require("../helper/coreAssets.json");

const STAKING_CONTRACT =
  "archway1p3wrpsrxldc6laecc8r3ck52cmg3chu06mmm3thqvt6exy36f79q575rsq";
const SWAP_CONTRACT =
  "archway1ywv0gxrw3kv25kn9f05dtqf6577fer5pc2vewvgcagpm5p8l4kuqc4qfp6";

async function tvl(api) {
  const { chain } = api;

  const statusStakingInfo = await queryContract({
    contract: STAKING_CONTRACT,
    chain,
    data: { status_info: {} },
  });

  const statusSwapInfo = await queryContract({
    contract: SWAP_CONTRACT,
    chain,
    data: { status_info: {} },
  });

  api.add(ADDRESSES.archway.ARCH, statusStakingInfo.native.amount);
  api.add(ADDRESSES.archway.ARCH, statusSwapInfo.liquidity);
}

module.exports = {
  methodology:
    "TVL equals the sum of ARCH staked in the Stake Pool and ARCH in the Instant Unstaking Queue, multiplied by the current ARCH price.",
  timetravel: false,
  archway: {
    tvl,
  },
};
