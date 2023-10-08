const ADDRESSES = require('../helper/coreAssets.json')

const { aaveExports } = require('../helper/aave');

module.exports = {
  ethereum: aaveExports('ethereum', '0x03cFa0C4622FF84E50E75062683F44c9587e6Cc1', undefined, ["0xFc21d6d146E6086B8359705C8b28512a983db0cb"], { v3: true, blacklistedTokens: [ADDRESSES.ethereum.DAI]}),
  xdai: aaveExports('xdai', '0x8839aC188064542331D4E7f6112aab7b71ac706F', undefined, ["0x61B989D473a977884Ac73A3726e1d2f7A6b50e07"], { v3: true})
};