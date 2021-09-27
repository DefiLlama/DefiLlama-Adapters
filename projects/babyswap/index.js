const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const { addFundsInMasterChef } = require("../helper/masterchef");
const { transformBscAddress } = require("../helper/portedTokens");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");

const MasterChefContract = "0xdfAa0e08e357dB0153927C7EaBB492d1F60aC730";
const BABY = "0x53E562b9B7E5E94b81f10e96Ee70Ad06df3D2657";

/*** Staking of native token (BABY) TVL portion ***/
const staking = async (chainBlocks) => {
  const balances = {};

  let transformAddress = await transformBscAddress();

  await sumTokensAndLPsSharedOwners(
    balances,
    [[BABY, false]],
    [MasterChefContract],
    chainBlocks["bsc"],
    "bsc",
    transformAddress
  );

  return balances;
};

const bscTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  let transformAddress = await transformBscAddress();

  await addFundsInMasterChef(
    balances,
    MasterChefContract,
    chainBlocks["bsc"],
    "bsc",
    transformAddress,
    abi.poolInfo,
    [
      "0x53E562b9B7E5E94b81f10e96Ee70Ad06df3D2657",
      "0xdfAa0e08e357dB0153927C7EaBB492d1F60aC730",
    ]
  );

  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  staking: {
    tvl: staking,
  },
  bsc: {
    tvl: bscTvl,
  },
  tvl: sdk.util.sumChainTvls([bscTvl]),
  methodology:
    "We count liquidity on the Farms (LP tokens) and Pools (single tokens) seccions threw MasterChef Contract",
};
