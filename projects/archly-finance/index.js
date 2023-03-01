const { getUniTVL, sumTokensExport } = require('../helper/unknownTokens')

const ARCHLY_FACTORY_OTHER = "0xBa06043a777652BAF540CcC785EDaFd94eE05b37"
const ARCHLY_VE_TOKEN_OTHER = "0xf070654b08595f8F358Ff90170829892F3254C67"
const ARCHLY_ARC_TOKEN_OTHER = "0x684802262D614D0Cd0C9571672F03Dd9e85D7824"

module.exports={
    telos:{
        tvl: getUniTVL({ factory: '0x39fdd4Fec9b41e9AcD339a7cf75250108D32906c', chain: 'telos', useDefaultCoreAssets: true }),
        staking: sumTokensExport({
            owner: '0x5680b3059b860d07A33B7A43d03D2E4dEdb226BB',
            tokens: ['0xa84df7aFbcbCC1106834a5feD9453bd1219B1fb5'],
            lps: ['0x34480A4C917caDbE41cb805f3e3baDb93bD9068C'],
            coreAssets: ['0xD102cE6A4dB07D247fcc28F366A623Df0938CA9E'],
            restrictTokenRatio: 100,
        })
    },
    arbitrum_nova:{
        tvl: getUniTVL({ factory: ARCHLY_FACTORY_OTHER, chain: 'arbitrum_nova', useDefaultCoreAssets: true }),
        staking: sumTokensExport({
            owner: ARCHLY_VE_TOKEN_OTHER,
            tokens: [ARCHLY_ARC_TOKEN_OTHER],
            lps: ['0xC8Cb0012BBBEFE6E04d9A58fFb5b9A623f4EC40c'],
            coreAssets: ['0x722e8bdd2ce80a4422e880164f2079488e115365'],
            restrictTokenRatio: 100,
        })
    },
    bsc:{
        tvl: getUniTVL({ factory: ARCHLY_FACTORY_OTHER, chain: 'bsc', useDefaultCoreAssets: true }),
        staking: sumTokensExport({
            owner: ARCHLY_VE_TOKEN_OTHER,
            tokens: [ARCHLY_ARC_TOKEN_OTHER],
            lps: ['0x3a1c6C7Ced1c14e07385582c5bB82eFBA4df4f19'],
            coreAssets: ['0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'],
            restrictTokenRatio: 100,
        })
    },
    fantom:{
        tvl: getUniTVL({ factory: ARCHLY_FACTORY_OTHER, chain: 'fantom', useDefaultCoreAssets: true }),
        staking: sumTokensExport({
            owner: ARCHLY_VE_TOKEN_OTHER,
            tokens: [ARCHLY_ARC_TOKEN_OTHER],
            lps: ['0xe962fEF0e7cE6D666359Dab6127f6f8d814aC1a9'],
            coreAssets: ['0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83'],
            restrictTokenRatio: 100,
        })
    },
    kava:{
        tvl: getUniTVL({ factory: ARCHLY_FACTORY_OTHER, chain: 'kava', useDefaultCoreAssets: true }),
        staking: sumTokensExport({
            owner: ARCHLY_VE_TOKEN_OTHER,
            tokens: [ARCHLY_ARC_TOKEN_OTHER],
            lps: ['0x008C71505A2e110d1FFAA402B01aeb202fb107dB'],
            coreAssets: ['0xc86c7C0eFbd6A49B35E8714C5f59D99De09A225b'],
            restrictTokenRatio: 100,
        })
    },
    optimism:{
        tvl: getUniTVL({ factory: ARCHLY_FACTORY_OTHER, chain: 'optimism', useDefaultCoreAssets: true }),
        staking: sumTokensExport({
            owner: ARCHLY_VE_TOKEN_OTHER,
            tokens: [ARCHLY_ARC_TOKEN_OTHER],
            lps: ['0xc492BCa6777818256C2e2e5FC8e180BC8697DfF5'],
            coreAssets: ['0x4200000000000000000000000000000000000042'],
            restrictTokenRatio: 100,
        })
    },
    polygon:{
        tvl: getUniTVL({ factory: ARCHLY_FACTORY_OTHER, chain: 'polygon', useDefaultCoreAssets: true }),
        staking: sumTokensExport({
            owner: ARCHLY_VE_TOKEN_OTHER,
            tokens: [ARCHLY_ARC_TOKEN_OTHER],
            lps: ['0x2651D7B53BaF1925D28A3b5A3ef371274e630C4C'],
            coreAssets: ['0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270'],
            restrictTokenRatio: 100,
        })
    }
}