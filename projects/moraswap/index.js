const { getUniTVL } = require('../helper/unknownTokens')
const { stakingUnknownPricedLP } = require('../helper/staking.js')

const dexTVL_neon = getUniTVL({ factory: '0xd43F135f6667174f695ecB7DD2B5f953d161e4d1', useDefaultCoreAssets: true, queryBatched: 10, waitBetweenCalls: 1000 })

module.exports = {
    misrepresentedTokens: true,
    neon_evm: {
        tvl: dexTVL_neon,
        staking: stakingUnknownPricedLP("0xa3da566fdE97c90c08052f612BdBed8F3B8004B7", "0x2043191e10a2A4b4601F5123D6C94E000b5d915F", 'neon_evm', '0xe6faaf048b2A9b9Bf906aBdD8623811458d81Cf3'),
    }
};


