const abi = require("./abi.json");
const { getCompoundV2Tvl } = require("../helper/compound");
const { transformBscAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");

const comptroller = "0x44f2A790aCB1bE42d3F7864e9F73762556eb895E";
const cBNB = "0xC819cCfA453C4b5D2B9c9fF7CF8017adE99CB9B1";
const WBNBEquivalent = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";

const stakingChef = "0xbfcaB1627c4fB86A055DE4B8a56D46e625F51C0B";

const stakingPools = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};
  let transformAddress = await transformBscAddress();

  await addFundsInMasterChef(
    balances,
    stakingChef,
    chainBlocks["bsc"],
    "bsc",
    transformAddress,
    abi.poolInfo
  );

  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    staking: stakingPools,
    tvl: getCompoundV2Tvl(
      comptroller,
      "bsc",
      (addr) => `bsc:${addr}`,
      cBNB,
      WBNBEquivalent
    ),
  },
  methodology:
    "We count liquidity on the lending markets same as compound; and the Pools (LP Piars) through Chef Contract",
};
