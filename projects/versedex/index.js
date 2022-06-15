const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");

const FLEXUSD = "0x7b2B3C5308ab5b2a1d9a94d20D35CCDf61e05b72";
const WBCH = "0x3743eC0673453E5009310C727Ba4eaF7b3a1cc04";
const FACTORY = "0x16bc2B187D7C7255b647830C05a6283f2B9A3AF8";

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0x16bc2B187D7C7255b647830C05a6283f2B9A3AF8) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  smartbch: {
    tvl: calculateUsdUniTvl(
      FACTORY,
      "smartbch",
      WBCH,
      [FLEXUSD],
      "bitcoin-cash"
    ),
  },
};
