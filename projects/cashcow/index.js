const ADDRESSES = require('../helper/coreAssets.json')
const abi = {
    "poolInfo": "function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accCowPerShare)"
  };
const { compoundExports } = require("../helper/compound");
const { addFundsInMasterChef } = require("../helper/masterchef");

const comptroller = "0x44f2A790aCB1bE42d3F7864e9F73762556eb895E";
const cBNB = "0xC819cCfA453C4b5D2B9c9fF7CF8017adE99CB9B1";
const WBNBEquivalent = ADDRESSES.bsc.WBNB;

const stakingChef = "0xbfcaB1627c4fB86A055DE4B8a56D46e625F51C0B";

const stakingPools = async (_ts, _b, chainBlocks) => {
  const balances = {};
  let transformAddress = i => `bsc:${i}`;

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
  bsc: {
    staking: stakingPools,
    ...compoundExports(comptroller,
      cBNB,
      WBNBEquivalent)
  },
  methodology:
    "We count liquidity on the lending markets same as compound; and the Pools (LP Piars) through Chef Contract",
};
