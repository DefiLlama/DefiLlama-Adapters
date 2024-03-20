const abi = require("./abi.json");
const { staking } = require("../helper/staking");
const { addFundsInMasterChef } = require("../helper/masterchef");

const BDPMasterContract = "0x0De845955E2bF089012F682fE9bC81dD5f11B372";
const BDP = "0xf3dcbc6d72a4e1892f7917b7c43b74131df8480e";

const chain = 'ethereum'

const ethTvl = async (api) => {
  const balances = {};
  await addFundsInMasterChef(
    balances,
    BDPMasterContract,
    api.block,
    chain,
    addr => addr,
    abi.poolInfo,
  );
  return balances
};

module.exports = {
  ethereum: {
    staking: staking(BDPMasterContract, BDP),
    tvl: ethTvl,
  },
  methodology: `Counts liquidity in masterchef`
}