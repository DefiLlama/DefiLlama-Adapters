const { getUniTVL, sumTokensExport } = require('../helper/unknownTokens')
const ARX = "0xD5954c3084a1cCd70B4dA011E67760B8e78aeE84";

const dexTVL = getUniTVL({ factory: '0x1C6E968f2E6c9DEC61DB874E28589fd5CE3E1f2c',  useDefaultCoreAssets: true })

const STAKING_CONTRACTS = [
    '0xd2bcFd6b84E778D2DE5Bb6A167EcBBef5D053A06',
    '0xee1D57aCE6350D70E8161632769d29D34B2FbfC8', '0x489732e4D028e500C327F1424931d428Ba695dF6',
    '0x907E5d334F27a769EF779358089fE5fdAA6cf2Bb', '0x75Bca51be93E97FF7D3198506f368b472730265a',
    '0x466f4380327cD948572AE0C98f2E04930ce05767', '0xf4752a5f352459948620e7C377b10ddcC92015c8'
]

module.exports = {
    misrepresentedTokens: true,
    methodology: `Uses factory(0x1C6E968f2E6c9DEC61DB874E28589fd5CE3E1f2c) address and whitelisted tokens address to find and price Liquidity Pool pairs. We also have our native token $ARX staking.`,
    arbitrum: {
        tvl: dexTVL,
        staking: sumTokensExport({
            owners: STAKING_CONTRACTS,
            tokens: [ARX],
        })
    }
};
