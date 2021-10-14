const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { transformFantomAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");
const {staking} = require("../helper/staking");
const BigNumber = require("bignumber.js");

const MASTERCHEF = "0x4de6c2de6b9eBD974738686C9be7a31597146Ac6";
const MASTERCHEF2 = "0x92eEd89eeC81d992FF9135Ee451008E93b83dD86";
const MASTERCHEF3 = "0xC8FF977ee4e5EdA2D650C0e2706995a1DbB4926b";
const MASTERCHEF4 = "0xaDb6C60f0D62d6e7583e4b7B3697aAAd723d4a85";

const GPL = "0xdDa7DA47f3b53aA1FcB341650C614DaF554f3e57"
const EARS = "0x0EC4B89462557150302AC6e81270a081F2e3BD20"

const masterchefTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const transformAddress = await transformFantomAddress();

  await addFundsInMasterChef(
    balances,
    MASTERCHEF,
    chainBlocks.fantom,
    "fantom",
    transformAddress,
    abi.poolInfo
  );

  return balances;
};

const masterchefTvl2 = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const transformAddress = await transformFantomAddress();

  await addFundsInMasterChef(
    balances,
    MASTERCHEF2,
    chainBlocks.fantom,
    "fantom",
    transformAddress,
    abi.poolInfo
  );

  return balances;
};

const masterchefTvl3 = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const transformAddress = await transformFantomAddress();

  await addFundsInMasterChef(
    balances,
    MASTERCHEF3,
    chainBlocks.fantom,
    "fantom",
    transformAddress,
    abi.poolInfo
  );

  return balances;
};

const masterchefTvl4 = async (timestamp, ethBlock, chainBlocks) => {
    const balances = {};
  
    const transformAddress = await transformFantomAddress();
  
    await addFundsInMasterChef(
      balances,
      MASTERCHEF4,
      chainBlocks.fantom,
      "fantom",
      transformAddress,
      abi.poolInfo
    );
  
    return balances;
  };

module.exports = {
  staking:{
    tvl: staking(GPL, EARS, 'fantom')
  },
  tvl: sdk.util.sumChainTvls([
    masterchefTvl,
    masterchefTvl2,
    masterchefTvl3,
    masterchefTvl4,
  ]),
};
