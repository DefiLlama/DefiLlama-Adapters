const abi = require("./abi.json");
const { addFundsInMasterChef } = require("../helper/masterchef");

const SaffronStakingV2Contract = "0x4eB4C5911e931667fE1647428F38401aB1661763";

const ethTvl = async (chainBlocks) => {
  const balances = {};

  await addFundsInMasterChef(
    balances,
    SaffronStakingV2Contract,
    chainBlocks.ethereum,
    "ethereum",
    (addr) => addr,
    abi.poolInfo
  );

  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: ethTvl,
  },
  methodology:
    "We count liquidity for Saffon V2 on the Pools (LP) through SaffronStakingV2 Contract",
};
