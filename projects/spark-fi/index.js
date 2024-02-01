const ADDRESSES = require('../helper/coreAssets.json')

const { aaveExports } = require('../helper/aave');

module.exports = {
  ethereum: aaveExports('ethereum', '0x03cFa0C4622FF84E50E75062683F44c9587e6Cc1', undefined, ["0xFc21d6d146E6086B8359705C8b28512a983db0cb"], { v3: true, blacklistedTokens: [ADDRESSES.ethereum.DAI]}),
  xdai: aaveExports('xdai', '0xA98DaCB3fC964A6A0d2ce3B77294241585EAbA6d', undefined, ["0x2a002054A06546bB5a264D57A81347e23Af91D18"], { v3: true})
};