const abi = require("./abi.json");
const { staking } = require("../helper/staking");
const { pool2s } = require("../helper/pool2");
const { transformBscAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");

// --- Farms Addresses ---
const masterChefFarms = "0x8932a6265b01D1D4e1650fEB8Ac38f9D79D3957b";
const MASH = "0x787732f27d18495494cea3792ed7946bbcff8db2";

const pool2LpsFarms = [
  "0x87c182edb12f74d561519ab586205fe6cd75363a",
  "0x7621886ac71e985dbea4f3f563bbb5a7865876a8",
  "0x0e70ff44229c6573cc020921345948ba4b5ec7cc",
  "0x9f8223b4b616aa9becb599c93b0430c6bef0443a",
  "0x16940bc578c30c7c10a2cf8a150b98a8b1cee152",
  "0x9EC365D77dCF2b3230399a23D35aEF4318de710D",
  "0xb442780739037577920857DaD91259416b72DE7a",
  "0xC6D926086b29774b10530ab9e02980e9586a061F",
];

// --- SafeFarms Addresses ---
const masterChefSafeFarms = "0xEE49Aa34833Ca3b7d873ED63CDBc031A09226a5d";
const TOFY = "0xe1f2d89a6c79b4242f300f880e490a70083e9a1c";

const pool2LpsSafeFarms = [
  "0x6f73FF29E47C0F49d6Db7EF4B2CE9393256a7C7A",
  "0x753f40F5CdeB085AD4540Dd02a1c0c712EaF51F6",
  "0xc36e93F6D92be42E2eAFB009dF74a0eBFeD5c0C2",
];

const Staking = async (...params) => {
  for (const token of [MASH, TOFY]) {
    if (token == MASH) {
      return staking(masterChefFarms, MASH, "bsc")(...params);
    } else {
      return staking(masterChefSafeFarms, TOFY, "bsc")(...params);
    }
  }
};

const Pool2 = async (...params) => {
  for (const stakingContract of [masterChefFarms, masterChefSafeFarms]) {
    if (stakingContract == masterChefFarms) {
      return pool2s([masterChefFarms], pool2LpsFarms, "bsc")(...params);
    } else {
      return pool2s([masterChefSafeFarms], pool2LpsSafeFarms, "bsc")(...params);
    }
  }
};

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
    ["0x00000000548997391c670a5179Af731A30e7c3Ad", MASH],
    true,
    true,
    MASH
  );

  await addFundsInMasterChef(
    balances,
    masterChefSafeFarms,
    chainBlocks["bsc"],
    "bsc",
    transformAddress,
    abi.poolInfo,
    [TOFY],
    true,
    true,
    TOFY
  );

  return balances;
};

module.exports = {
  bsc: {
    tvl: bscTvl,
    staking: Staking,
    pool2: Pool2,
  },
  methodology:
    "We count liquidity on the Farms and Pools through MasterChef (Marshamallow and SafeFarm) Contracts",
};
