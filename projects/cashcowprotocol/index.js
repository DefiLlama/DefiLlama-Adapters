const { transformBscAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");

const MasterChef = "0x94098E24FCf4701237CF58ef2A222C1cF5003c86";

const bscTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};
  let transformAddress = await transformBscAddress();

  await addFundsInMasterChef(
    balances,
    MasterChef,
    chainBlocks["bsc"],
    "bsc",
    transformAddress
  );

  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: bscTvl,
  },
  methodology:
    "We count liquidity on the Farms (LP Piars) through MasterChef Contract",
};
