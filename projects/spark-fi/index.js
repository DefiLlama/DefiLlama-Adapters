const { aaveExports, } = require('../helper/aave');
const { staking } = require('../helper/staking')

const ethereumTvl = aaveExports('', '0x03cFa0C4622FF84E50E75062683F44c9587e6Cc1', undefined, ["0xFc21d6d146E6086B8359705C8b28512a983db0cb"], { v3: true });
const ethereumStaking = staking("0xc6132FAF04627c8d05d6E759FAbB331Ef2D8F8fD", "0xc20059e0317DE91738d13af027DfC4a50781b066")

module.exports = {
  ethereum: {
    ...ethereumTvl,
    staking: ethereumStaking,
  },
  xdai: aaveExports('', '0xA98DaCB3fC964A6A0d2ce3B77294241585EAbA6d', undefined, ["0x2a002054A06546bB5a264D57A81347e23Af91D18"], { v3: true })
};