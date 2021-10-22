const sdk = require("@defillama/sdk");
const { staking } = require("../helper/staking");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { transformFantomAddress } = require("../helper/portedTokens");

const MasterChefContract = "0x155482Bd4e5128082D61a2384935D4BBDcb0E7a7";
const stakingContract = "0x61Befe6E5f20217960bD8659cd3113CC1ca67d2F";
const WFTM = "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83";

const ftmTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  let transformAddress = await transformFantomAddress();

  await addFundsInMasterChef(
    balances,
    MasterChefContract,
    chainBlocks["fantom"],
    "fantom",
    transformAddress
  );

  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  staking: {
    tvl: staking(stakingContract, WFTM, "fantom"),
  },
  fantom: {
    tvl: ftmTvl,
  },
  tvl: sdk.util.sumChainTvls([ftmTvl]),
  methodology: "We count liquidity on the Farms through MasterChef Contract",
};
