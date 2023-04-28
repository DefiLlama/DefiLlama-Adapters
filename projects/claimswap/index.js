const { getUniTVL,  } = require('../helper/unknownTokens');
const { staking,  } = require('../helper/staking');


module.exports = {
  methodology: `Tvl counts the tokens locked on AMM pools and staking counts the CLA that has been staked`,
  klaytn: {
    tvl: getUniTVL({ factory: '0x3679c3766E70133Ee4A7eb76031E49d3d1f2B50c', useDefaultCoreAssets: true, }),
    staking: staking('0x5f5dec0d6402408ee81f52ab985a9c665b6e6010', '0xcf87f94fd8f6b6f0b479771f10df672f99eada63'),
  },
  misrepresentedTokens: true,
}