const abi = require("./abi.json");
const { staking } = require("../helper/staking");
const { pool2BalanceFromMasterChefExports } = require("../helper/pool2");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { transformBscAddress } = require("../helper/portedTokens");

const farmContract = "0xdA842fad0BDb105c88399e845aD4D00dE3AEb911";
const TEN = "0x74159651a992952e2bf340d7628459aa4593fc05";

const farmContract_bsc = "0x3F4c79EB1220BeBBf5eF4B3e7c59E5cf38200b62";
const TEN_bsc = "0xdFF8cb622790b7F92686c722b02CaB55592f152C";

const ethTvl = async (chainBlocks) => {
  const balances = {};

  await addFundsInMasterChef(
    balances,
    farmContract,
    chainBlocks["ethereum"],
    "ethereum",
    (addr) => addr,
    abi.poolSettingInfo,
    [],
    true,
    true,
    TEN
  );

  return balances;
};

const bscTvl = async (chainBlocks) => {
  const balances = {};

  let transformAddress = await transformBscAddress();
  await addFundsInMasterChef(
    balances,
    farmContract_bsc,
    chainBlocks["bsc"],
    "bsc",
    transformAddress,
    abi.poolSettingInfo,
    ["0xa901c7800497E2461E244D9F8680a109a4356Eae"],
    true,
    true,
    TEN_bsc
  );

  return balances;
};

module.exports = {
  timetravel: true,
  ethereum: {
    staking: staking(farmContract, TEN),
    pool2: pool2BalanceFromMasterChefExports(
      farmContract,
      TEN,
      "ethereum",
      (addr) => addr,
      abi.poolSettingInfo
    ),
    tvl: ethTvl,
  },
  bsc: {
    staking: staking(farmContract_bsc, TEN_bsc),
    pool2: pool2BalanceFromMasterChefExports(
      farmContract_bsc,
      TEN_bsc,
      "bsc",
      (addr) => `bsc:${addr}`,
      abi.poolSettingInfo
    ),
    tvl: bscTvl,
  },
  methodology: "We count liquidity on all the Farms through MasterChef Contracts",
};
