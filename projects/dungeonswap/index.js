const sdk = require("@defillama/sdk");
//const abi = require("./abi.json");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { transformBscAddress } = require("../helper/portedTokens");

const MasterChefContract = "0x3720F1F9a02BFB4dD6afb9030eB826B4392D321F";
//const BABY = "";

const bscTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  let transformAddress = await transformBscAddress();

  await addFundsInMasterChef(
    balances,
    MasterChefContract,
    chainBlocks["bsc"],
    "bsc",
    transformAddress,
    /*abi.poolInfo,
    [
      "0x53E562b9B7E5E94b81f10e96Ee70Ad06df3D2657",
      "0xdfAa0e08e357dB0153927C7EaBB492d1F60aC730",
    ]*/
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
