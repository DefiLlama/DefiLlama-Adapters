const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { staking } = require("../helper/staking");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { transformFantomAddress } = require("../helper/portedTokens");

const MasterChefV1Contract = "0x155482Bd4e5128082D61a2384935D4BBDcb0E7a7";
const MasterChefV2Contract = "0x2447115E9Ba73bd2877821BF69E09259664a2bd5";

const stakingContract = "0x61Befe6E5f20217960bD8659cd3113CC1ca67d2F";
const WFTM = ADDRESSES.fantom.WFTM;

const ftmTvl = async (timestamp, ethBlock, chainBlocks) => {

  const balances = {};

  let transformAddress = await transformFantomAddress();

  await addFundsInMasterChef(
    balances,
    MasterChefV1Contract,
    chainBlocks["fantom"],
    "fantom",
    transformAddress
  );



  return balances;
};

const v2TVL = async (timestamp, ethBlock, chainBlocks) => {
  let balances = {};
  let transformAddress = await transformFantomAddress();
  await addFundsInMasterChef(
    balances,
    MasterChefV2Contract,
    chainBlocks["fantom"],
    "fantom",
    transformAddress
  );

  return balances;
}



module.exports = {
  misrepresentedTokens: true,
  fantom: {
    staking: staking(stakingContract, WFTM, "fantom"),
    tvl: sdk.util.sumChainTvls([ftmTvl, v2TVL]),
  },
  methodology: "We count liquidity on the Farms through MasterChef and MasterChefv2 Contract",
};
