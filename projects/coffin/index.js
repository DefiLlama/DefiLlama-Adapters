const sdk = require("@defillama/sdk");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { transformFantomAddress } = require("../helper/portedTokens");

const MasterChefContract = "0x155482Bd4e5128082D61a2384935D4BBDcb0E7a7";

const ftmTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  let transformAddress = await transformFantomAddress();

  await addFundsInMasterChef(
    balances,
    MasterChefContract,
    chainBlocks["fantom"],
    "fantom",
    transformAddress
  );

  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  fantom: {
    tvl: ftmTvl,
  },
  tvl: sdk.util.sumChainTvls([ftmTvl]),
  methodology:
    "We count liquidity on the Farms through MasterChef Contract",
};
