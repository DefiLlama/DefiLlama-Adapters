const { getUniTVL } = require('../helper/unknownTokens')

const ethFactory = "0x5FA0060FcfEa35B31F7A5f6025F0fF399b98Edf1";

module.exports = {
    methodology: 'The Factory address is used to find the liquidity in each of the LP pairs',
    bsc: {
      tvl: getUniTVL({
        chain: 'bsc', useDefaultCoreAssets: true,
        factory: '0xE52cCf7B6cE4817449F2E6fA7efD7B567803E4b4',
      }),
    },
    ethereum: {
        tvl: getUniTVL({
          chain: 'ethereum', useDefaultCoreAssets: true,
          factory: ethFactory,
        }),
    },
  }
