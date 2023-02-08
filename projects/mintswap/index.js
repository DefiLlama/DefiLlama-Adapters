const { addFundsInMasterChef } = require("../helper/masterchef");

const masterChefContract = "0xAdD22604caf79139450e9fb4851394fFCE1692Be";

const avaxTvl = async (chainBlocks) => {
  const balances = {};

  const transformAddress = addr => 'avax:'+addr
  await addFundsInMasterChef(
    balances,
    masterChefContract,
    chainBlocks.avax,
    "avax",
    transformAddress,
  );

  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  avax: {
    tvl: avaxTvl,
  },
  methodology:
    "We count liquidity on the Farms and Pools through MasterChef Contract",
};
