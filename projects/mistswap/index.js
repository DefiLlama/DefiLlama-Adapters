const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");
const { staking } = require('../helper/staking')

const xMIST = "0xC41C680c60309d4646379eD62020c534eB67b6f4";
const MIST = "0x5fA664f69c2A4A3ec94FaC3cBf7049BD9CA73129";
const FLEXUSD = "0x7b2B3C5308ab5b2a1d9a94d20D35CCDf61e05b72";
const WBCH = "0x3743eC0673453E5009310C727Ba4eaF7b3a1cc04";
const FACTORY = "0x6008247F53395E7be698249770aa1D2bfE265Ca0";

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0x6008247F53395E7be698249770aa1D2bfE265Ca0) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  smartbch: {
    tvl: calculateUsdUniTvl(
      FACTORY,
      "smartbch",
      WBCH,
      [MIST, FLEXUSD],
      "bitcoin-cash"
    ),
    staking: staking(xMIST, MIST, 'smartbch', 'mistswap', 18)
  },
};
