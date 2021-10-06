const sdk = require("@defillama/sdk");
const { staking } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");
const { getCompoundV2Tvl } = require("../helper/compound");

const StakingContract = "0x9E15Ad979919bB4db331Bfe864475Ae3BFFebA93";
const OM = "0x3593d125a4f7849a1b059e64f4517a86dd60c95d";

const StakingContract_OM_ETH = "0x91FE14Df53Eae3A87E310ec6edcdD2D775E1A23f";
const OM_ETH_UNIV2 = "0xe46935aE80E05cdEbD4a4008B6ccaA36d2845370";

const comptroller = "0x606246e9EF6C70DCb6CEE42136cd06D127E2B7C7";
const zenETH = "0x4F905f75F5576228eD2D0EA508Fb0c32a0696090";
const zenETHEquivalent = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

const ethTvl = async (...params) => {
  return getCompoundV2Tvl(
    comptroller,
    "ethereum",
    (addr) => addr,
    zenETH,
    zenETHEquivalent
  )(...params);
};

module.exports = {
  misrepresentedTokens: true,
  staking: {
    tvl: staking(StakingContract, OM),
  },
  pool2: {
    tvl: pool2(StakingContract_OM_ETH, OM_ETH_UNIV2),
  },
  ethereum: {
    tvl: ethTvl,
  },
  tvl: sdk.util.sumChainTvls([ethTvl]),
  methodology:
    "We count liquidity on the pool2, and on the markets same as compound",
};
