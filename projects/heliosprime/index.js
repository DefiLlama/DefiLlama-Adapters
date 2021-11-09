const sdk = require("@defillama/sdk");
const { staking } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");
const {getComponents} = require('./abi.json');
const { sumTokens } = require("../helper/unwrapLPs");

const CoverageContract = "0x69c316563414d091c57C7Ec098523e43Baa5E175";
const USDT = "0xdac17f958d2ee523a2206206994597c13d831ec7";
const EDP = "0x7633da43dfd4ee5a5da99740f077ca9d97aa0d0e"

const StakingContract_BMI = "0xDfB820b95EEE42A858f50BEfbF834D2d24621153";
const BMI = "0x725c263e32c72ddc3a19bea12c5a0479a81ee688";

const StakingContract_BMI_ETH = "0x49791b39B8cb01ad5f207c296123fD772D5C0d62";
const BMI_ETH_UNIV2 = "0xa9Bd7EEF0c7AfFbdBDAE92105712E9Ff8b06Ed49";

const ethTvl = async (time, block) => {
  const components = await sdk.api.abi.call({
    target: EDP,
    block,
    abi: getComponents
  })
  const balances={}
  await sumTokens(balances, components.output.map(t=>[t, EDP]), block)
  return balances
};

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: ethTvl,
  },
  methodology:
    "We count liquidity on the pool2, and it counts the staking of native token separtly",
};
