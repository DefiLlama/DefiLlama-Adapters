const { staking } = require('../helper/staking')
const { getUniTVL } = require('../helper/unknownTokens');
const { getTridentTVL } = require('../helper/sushi-trident')
const sdk = require('@defillama/sdk')

const AQUA_FACTORY = '0x77716798B9E470439D02C27107632FbFd10aF345';
const AQUA_V3 = '0x198763c1347EA879e26c2564C6F51FDfCB24EF01';
const CLAM_MASTERCHEF = '0x19562EF0c60837e71eb78b66786D7070bB3675a0';
const PEARL_MASTERCHEF = '0x952F202B5E58058DEb468cd30d081922C36bf29a';
const KRILL_MASTERCHEF = '0x68e83E5300594E664701Aa38A1d80F9524cA82D8';

const tokens = {
  "sBWPM": "0xf4546e1d3ad590a3c6d178d671b3bc0e8a81e27d",
  "KRILL": "0x83bc9fe9eebfeb1ad4178ac5e7445dc6a7e95718",
  "PEARL": "0xb3b1b54e3b9a27cee606f1018760abec4274bd35",
  "CLAM": "0xba9725eaccf07044625f1d232ef682216f5371c2",
  "sADOL": "0x4f3ac44bb2345d3960e34dd5dfe275249e43ae4a"
}

module.exports = {
  misrepresentedTokens: true,
  methodology: `counts the number of tokens in the Bluewhale contract. `,
  klaytn: {
    tvl: sdk.util.sumChainTvls([
      getUniTVL({ factory: AQUA_FACTORY, useDefaultCoreAssets: true }), 
      getTridentTVL({ chain: 'klaytn', factory:AQUA_V3 }),
    ]),
    staking: staking([PEARL_MASTERCHEF, CLAM_MASTERCHEF, KRILL_MASTERCHEF], [tokens.PEARL, tokens.CLAM, tokens.sBWPM]),
  },
};