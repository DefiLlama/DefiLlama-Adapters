const { getUniTVL } = require("../helper/unknownTokens");

const FACTORY = "0x1c3E50DBBCd05831c3A695d45D2b5bCD691AD8D8";

module.exports = {
  methodology: `Uses factory(${FACTORY}) address and whitelisted tokens address to find and price Liquidity Pool pairs`,
  misrepresentedTokens: true,
  doublecounted: false,
  timetravel: true,
  incentivized: true,
  bsc: {
    tvl: getUniTVL({
      factory: FACTORY,
      chain: "bsc",
      useDefaultCoreAssets: true,
    }),
  },
};
