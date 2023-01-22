
const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0x7Bbbb6abaD521dE677aBe089C85b29e3b2021496) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  syscoin: {
    tvl: getUniTVL({
      chain: 'syscoin',
      factory: '0x7Bbbb6abaD521dE677aBe089C85b29e3b2021496',
      useDefaultCoreAssets: true,
    })
  },
};
