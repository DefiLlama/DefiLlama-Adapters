const ADDRESSES = require('../helper/coreAssets.json')
const { getUniTVL } = require('../helper/unknownTokens')
const { staking } = require('../helper/staking')
const { pool2 } = require('../helper/pool2')

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    staking: staking('0x024D59Ac0Bb03dEd28B9A16cd50B3d242B43a683', ADDRESSES.moonbeam.WGLMR),
    pool2: pool2('0x024D59Ac0Bb03dEd28B9A16cd50B3d242B43a683', '0xD5B1Cd8D245A93E0697707AEe82497388508b132'),
  },
  bsc: {
    staking: staking('0xc94e085E2E2D92A950fa4A6B923263C0B47c6dBa', '0x002D8563759f5e1EAf8784181F3973288F6856e4'),
    pool2: pool2('0xc94e085E2E2D92A950fa4A6B923263C0B47c6dBa', '0x0f35d854C267D29C0E418F561b75aE09B9E413D4'),
  },
  moonbeam: {
    tvl: getUniTVL({ factory: '0x61999fAb7fdcEe1B26b82b5c2f825BCC8F8c2458', useDefaultCoreAssets: true }),
  },
};