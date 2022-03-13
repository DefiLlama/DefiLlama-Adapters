const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");
const { stakingPricedLP } = require("../helper/staking");

const xMIST = "0xC41C680c60309d4646379eD62020c534eB67b6f4";
const MIST = "0x5fA664f69c2A4A3ec94FaC3cBf7049BD9CA73129";
const xMIST_WBCH_PAIR = "0xa331430473aba2337698fd95a7c2fcf376debfb1";

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0x6008247F53395E7be698249770aa1D2bfE265Ca0) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  smartbch: {
    tvl: calculateUsdUniTvl(
      "0x6008247F53395E7be698249770aa1D2bfE265Ca0",
      "smartbch",
      "0x3743eC0673453E5009310C727Ba4eaF7b3a1cc04",
      ["0x5fA664f69c2A4A3ec94FaC3cBf7049BD9CA73129"],
      "bitcoin-cash"
    ),
    staking: stakingPricedLP(
      xMIST,
      MIST,
      "smartbch",
      xMIST_WBCH_PAIR,
      "bitcoin-cash"
    ),
  },
};
