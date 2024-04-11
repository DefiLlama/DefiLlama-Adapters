const { getUniTVL } = require("../helper/unknownTokens");
const { stakings } = require("../helper/staking");

const FACTORY = "0x1c3E50DBBCd05831c3A695d45D2b5bCD691AD8D8";
const LOCKER = "0xd8e86cfD71A19AcF79B60fB75F0470185C95B06b";
const KSWAP = "0x29ABc4D03D133D8Fd1F1C54318428353CE08727E";

module.exports = {
  methodology: `Uses factory(${FACTORY}) address and whitelisted tokens address to find and price Liquidity Pool pairs`,
  misrepresentedTokens: true,
      incentivized: true,
  bsc: {
    tvl: getUniTVL({
      factory: FACTORY,
      useDefaultCoreAssets: true,
    }),
    staking: stakings([LOCKER], KSWAP),
  },
};
