const abi = require("./abi.json");
const { transformBscAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");

const masterChefFarms = "0x8932a6265b01D1D4e1650fEB8Ac38f9D79D3957b";
const masterChefSafeFarms = "0xEE49Aa34833Ca3b7d873ED63CDBc031A09226a5d";

const bscTvl = async (chainBlocks) => {
  const balances = {};

  let transformAddress = await transformBscAddress();
  await addFundsInMasterChef(
    balances,
    masterChefFarms,
    chainBlocks["bsc"],
    "bsc",
    transformAddress,
    abi.poolInfo,
    ["0x00000000548997391c670a5179Af731A30e7c3Ad"]
  );

  await addFundsInMasterChef(
    balances,
    masterChefSafeFarms,
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
  methodology:
    "We count liquidity on the Farms and Pools through MasterChef (Marshamallow and SafeFarm) Contracts",
};
