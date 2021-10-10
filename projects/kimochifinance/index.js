const sdk = require("@defillama/sdk");
const {staking} = require('../helper/staking');
const { addFundsInMasterChef } = require("../helper/masterchef");
const { transformBscAddress } = require("../helper/portedTokens");

const MasterChefContract = "0xc88264770C43826dE89bCd48a5c8BC5073e482a5";
const KIMOCHI = "0x4dA95bd392811897cde899d25FACe253a424BfD4"

const bscTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  let transformAddress = await transformBscAddress();

  await addFundsInMasterChef(
    balances,
    MasterChefContract,
    chainBlocks["bsc"],
    "bsc",
    transformAddress
  );

  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  staking: {
    tvl: staking(MasterChefContract, KIMOCHI, "bsc")
  },
  bsc: {
    tvl: bscTvl,
  },
  tvl: sdk.util.sumChainTvls([bscTvl]),
  methodology:
    "We count liquidity on the Farming seccion through MasterFarmer Contract",
};
