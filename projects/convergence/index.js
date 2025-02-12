const ETH_FACTORY = '0x4eef5746ED22A2fD368629C1852365bf5dcb79f1';
const MOONBEAM_FACTORY = '0x9504d0d43189d208459e15c7f643aac1abe3735d';
const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  start: '2021-05-17', //2021-05-17 00:00:00 +UTC
  misrepresentedTokens: true,
    ethereum: {
    tvl: getUniTVL({
      factory: ETH_FACTORY,
      useDefaultCoreAssets: true,
    })
  },
  moonbeam: {
    tvl: getUniTVL({
      factory: MOONBEAM_FACTORY,
      useDefaultCoreAssets: true,
    })
  }
};