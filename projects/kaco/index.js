const abi = require("./abi.json");
const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");

const { addFundsInMasterChef } = require("../helper/masterchef");
const { transformBscAddress } = require("../helper/portedTokens");
const { staking } = require("../helper/staking");

const KACMasterChefContract = {
  bsc: "0x81b71D0bC2De38e37978E6701C342d0b7AA67D59",
  shiden: "0x293A7824582C56B0842535f94F6E3841888168C8",
};
const KAC = {
  bsc: "0xf96429A7aE52dA7d07E60BE95A3ece8B042016fB",
  shiden: "0xb12c13e66ade1f72f71834f2fc5082db8c091358",
};

// node test.js projects/kaco/index.js
const bscTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  let transformAddress = await transformBscAddress();

  await addFundsInMasterChef(
    balances,
    KACMasterChefContract["bsc"],
    chainBlocks["bsc"],
    "bsc",
    transformAddress,
    abi.poolInfo,
    [KAC["bsc"], KACMasterChefContract["bsc"]]
  );

  return balances;
};

const shidenTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  let transformAddress = await transformBscAddress();

  await addFundsInMasterChef(
    balances,
    KACMasterChefContract["shiden"],
    chainBlocks["shiden"],
    "shiden",
    transformAddress,
    abi.poolInfo,
    [KAC["shiden"], KACMasterChefContract["shiden"]]
  );

  return balances;
};

module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  methodology:
    "Fast growing Defi on BSC and Shiden! Fractionalize and farm NFTs.",
  bsc: {
    staking: staking(KACMasterChefContract["bsc"], KAC["bsc"], "bsc"),
    tvl: bscTvl,
  },
  shiden: {
    staking: staking(
      KACMasterChefContract["shiden"],
      KAC["shiden"],
      "shiden",
      KAC["bsc"],
      0
    ),
    tvl: shidenTvl,
  },
};
