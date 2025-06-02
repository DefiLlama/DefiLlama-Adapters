const { getUniTVL } = require('../helper/unknownTokens')
const { staking, stakingPricedLP, stakingUnknownPricedLP } = require('../helper/staking.js');

module.exports = {
    misrepresentedTokens: true,
    aurora: {
        staking: staking("0x5205c30bf2E37494F8cF77D2c19C6BA4d2778B9B", "0x7faA64Faf54750a2E3eE621166635fEAF406Ab22"), // single staking
        tvl: getUniTVL({ factory: '0x7928D4FeA7b2c90C732c10aFF59cf403f0C38246', useDefaultCoreAssets: true }),
    },
};
