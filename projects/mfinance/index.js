const abi = require("./abi.json");
const { staking } = require("../helper/staking");
const { pool2BalanceFromMasterChefExports } = require("../helper/pool2");
const { masterChefExports } = require("../helper/masterchef");

const masterChef = "0x342A8A451c900158BA4f1367C55955b5Fbcb7CCe";
const MG = "0x06b0c26235699b15e940e8807651568b995a8e01";

const ethTvl = async (chainBlocks) => {
  const balances = {};

  await addFundsInMasterChef(
    balances,
    masterChef,
    chainBlocks["ethereum"],
    "ethereum",
    (addr) => addr,
    abi.poolInfo,
    [],
    true,
    true,
    MG
  );

  return balances;
};

module.exports = masterChefExports(masterChef, "ethereum", MG, false, abi.poolInfo)
