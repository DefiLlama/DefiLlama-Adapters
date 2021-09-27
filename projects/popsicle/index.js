const sdk = require("@defillama/sdk");
const poolInfoAbi = require("../helper/abis/masterchef.json");

const { addFundsInMasterChef } = require("../helper/masterchef");
const {
  transformBscAddress,
  transformFantomAddress,
} = require("../helper/portedTokens");

const MasterChefContract = "0xbf513aCe2AbDc69D38eE847EFFDaa1901808c31c";

const calcTvl = async (chain) => {
  const balances = {};
  let chainBlocks = {};

  const transformAddressBsc = await transformBscAddress();
  const transformAddressFtm = await transformFantomAddress();

  await addFundsInMasterChef(
    balances,
    MasterChefContract,
    chainBlocks[chain],
    chain,
    chain == "bsc" || chain == "fantom"
      ? chain == "bsc"
        ? transformAddressBsc
        : transformAddressFtm
      : (addr) => addr,
    poolInfoAbi.poolInfo,
    []
  );

  return balances;
};

const ethTvl = async () => {
  return calcTvl("ethereum");
};

const fantomTvl = async () => {
  return calcTvl("fantom");
};

const bscTvl = async () => {
  return calcTvl("bsc");
};

module.exports = {
  ethereum: {
    tvl: ethTvl,
  },
  bsc: {
    tvl: bscTvl,
  },
  fantom: {
    tvl: fantomTvl,
  },
  tvl: sdk.util.sumChainTvls([ethTvl, bscTvl, fantomTvl]),
  methodology:
    "We count liquidity on the Active Pools threw MasterChef Contract",
};
