const { addFundsInMasterChef } = require("../helper/masterchef");
const { pool2BalanceFromMasterChefExports} = require("../helper/pool2.js");

const MasterChef = "0x944dFb7f7caB8bbA2F74882784742C39b8495F5e";

const bscTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};
  let transformAddress = i => `bsc:${i}`;

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
    "We count liquidity on the Farms through MasterChef Contract",
};