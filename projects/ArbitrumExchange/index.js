const { getUniTVL, sumTokensExport } = require('../helper/unknownTokens')
const ARX = "0xD5954c3084a1cCd70B4dA011E67760B8e78aeE84";

const dexTVL = getUniTVL({ factory: '0x1C6E968f2E6c9DEC61DB874E28589fd5CE3E1f2c', fetchBalances: true, useDefaultCoreAssets: true })


module.exports = {
    misrepresentedTokens: true,
    methodology: `Uses factory(0x1C6E968f2E6c9DEC61DB874E28589fd5CE3E1f2c) address and whitelisted tokens address to find and price Liquidity Pool pairs. We also have our native token $ARX staking.`,
    arbitrum: {
        tvl: dexTVL,
        staking: sumTokensExport({
            owners: ['0xd2bcFd6b84E778D2DE5Bb6A167EcBBef5D053A06', '0xee1D57aCE6350D70E8161632769d29D34B2FbfC8', '0x907E5d334F27a769EF779358089fE5fdAA6cf2Bb', '0x75Bca51be93E97FF7D3198506f368b472730265a', '0x466f4380327cD948572AE0C98f2E04930ce05767'],
            tokens: [ARX],
            lps: ['0xA6efAE0C9293B4eE340De31022900bA747eaA92D', '0x4C42fA9Ecc3A17229EDf0fd6A8eec3F11D7E00D3', '0xD082d6E0AF69f74F283b90C3CDa9C35615Bce367', '0xA6A6090749B9E3010802C5bFF3845aa6A4AC321B', '0xFeafF2443f2489366a62FDDc0114Ad53B9aa03E9', '0x10A12127867d3885Ac64b51cc91a67c907eE51db'],
            useDefaultCoreAssets: true,
        })
    }
};
