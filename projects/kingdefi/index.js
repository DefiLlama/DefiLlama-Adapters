const sdk = require("@defillama/sdk");
const {staking} = require('../helper/staking');
const { addFundsInMasterChef } = require("../helper/masterchef");
const { transformBscAddress } = require("../helper/portedTokens");

const MasterChefContract = "0x49A44ea2B4126CC1C53C47Ed7f9a5905Cbecae8d";
const stakingContract = "0x98F3b99198E164f50272ea5Ba44Ea76B1a439876";
const KRW = "0x1446f3cedf4d86a9399e49f7937766e6de2a3aab";

const bscTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  let transformAddress = await transformBscAddress();

  await addFundsInMasterChef(
    balances,
    MasterChefContract,
    chainBlocks["bsc"],
    "bsc",
    transformAddress,
  );

  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  staking: {
    tvl: staking(stakingContract, KRW, "bsc")
  },
  bsc: {
    tvl: bscTvl,
  },
  tvl: sdk.util.sumChainTvls([bscTvl]),
  methodology:
    "We count liquidity on the Farms seccion through MasterChef Contract; and the staking part separtely",
};
