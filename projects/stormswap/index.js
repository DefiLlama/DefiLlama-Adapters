const sdk = require("@defillama/sdk");
const poolInfoAbi = require("../helper/abis/masterchef.json");

const { addFundsInMasterChef } = require("../helper/masterchef");
const { transformAvaxAddress } = require("../helper/portedTokens");

const MasterChefContract = "0xc1A97bCbaCf0566fc8C40291FFE7e634964b0446";

const avaxTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const transformAddress = await transformAvaxAddress();

  await addFundsInMasterChef(
    balances,
    MasterChefContract,
    chainBlocks["avax"],
    "avax",
    transformAddress,
    poolInfoAbi.poolInfo,
    []
  );

  return balances;
};

module.exports = {
  avax: {
    tvl: avaxTvl,
  },
  tvl: sdk.util.sumChainTvls([avaxTvl]),
  methodology:
    "We count liquidity on the Fields (LP tokens) and Lagoons(single tokens) seccions threw MasterChef Contract",
};
