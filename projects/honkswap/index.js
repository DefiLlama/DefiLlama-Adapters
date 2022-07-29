const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");

const HONK = "0xF2d4D9c65C2d1080ac9e1895F6a32045741831Cd";
const WBCH = "0x3743eC0673453E5009310C727Ba4eaF7b3a1cc04";
const FACTORY = "0x34D7ffF45108De08Ca9744aCdf2e8C50AAC1C73C";

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0x34D7ffF45108De08Ca9744aCdf2e8C50AAC1C73C) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  smartbch: {
    tvl: calculateUsdUniTvl(
      FACTORY,
      "smartbch",
      WBCH,
      [HONK],
      "bitcoin-cash"
    )
  }
}
