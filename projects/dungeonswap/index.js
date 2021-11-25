const sdk = require("@defillama/sdk");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { transformBscAddress } = require("../helper/portedTokens");

const MasterChefContract = "0x3720F1F9a02BFB4dD6afb9030eB826B4392D321F";

const bscTvl = async (chainBlocks) => {
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
  bsc: {
    tvl: bscTvl,
  },
  tvl: sdk.util.sumChainTvls([bscTvl]),
  methodology:
    "We count liquidity on the Farms and Pools seccions through MasterChef Contract",
};
