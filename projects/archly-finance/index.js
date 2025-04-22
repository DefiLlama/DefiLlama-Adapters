const ADDRESSES = require('../helper/coreAssets.json')
const { getUniTVL, sumTokensExport } = require('../helper/unknownTokens')

const ARCHLY_FACTORY_OTHER = "0xBa06043a777652BAF540CcC785EDaFd94eE05b37"
const ARCHLY_VE_TOKEN_OTHER = "0xf070654b08595f8F358Ff90170829892F3254C67"
const ARCHLY_ARC_TOKEN_OTHER = "0x684802262D614D0Cd0C9571672F03Dd9e85D7824"

module.exports = {
    telos: {
        tvl: getUniTVL({ factory: '0x39fdd4Fec9b41e9AcD339a7cf75250108D32906c',  useDefaultCoreAssets: true, hasStablePools: true, }),
        staking: sumTokensExport({
            owner: '0x5680b3059b860d07A33B7A43d03D2E4dEdb226BB',
            tokens: ['0xa84df7aFbcbCC1106834a5feD9453bd1219B1fb5'],
            lps: ['0x34480A4C917caDbE41cb805f3e3baDb93bD9068C'],
            coreAssets: [ADDRESSES.telos.WTLOS],
            restrictTokenRatio: 100,
        })
    },
    arbitrum: {
        tvl: getUniTVL({ factory: '0xeafBFeb64F8e3793D7d1767774efd33b203200C9',useDefaultCoreAssets: true, hasStablePools: true, }),
        staking: sumTokensExport({
            owner: '0x4c01dF6B9be381BA2a687D0ED5c40039dEEaf0a9',
            tokens: ['0x9435Ffb33Ce0180F55E08490C606eC3BD07da929'],
            lps: ['0x6083E6F4c0f9826e60D0180A00203F7A70C1aC25'],
            coreAssets: [ADDRESSES.arbitrum.WETH],
            restrictTokenRatio: 100,
        })
    },
    arbitrum_nova: {
        tvl: getUniTVL({ factory: ARCHLY_FACTORY_OTHER, useDefaultCoreAssets: true, hasStablePools: true, }),
        staking: sumTokensExport({
            owner: ARCHLY_VE_TOKEN_OTHER,
            tokens: [ARCHLY_ARC_TOKEN_OTHER],
            lps: ['0xC8Cb0012BBBEFE6E04d9A58fFb5b9A623f4EC40c'],
            coreAssets: [ADDRESSES.arbitrum_nova.WETH],
            restrictTokenRatio: 100,
        })
    },
    base: {
        tvl: getUniTVL({ factory: ARCHLY_FACTORY_OTHER, seDefaultCoreAssets: true, hasStablePools: true, }),
        staking: sumTokensExport({
            owner: "0x4c01dF6B9be381BA2a687D0ED5c40039dEEaf0a9",
            tokens: [ARCHLY_ARC_TOKEN_OTHER],
            lps: ['0x80dd4A2837AF3233176704142Fb44a216e170Ab3'],
            coreAssets: [ADDRESSES.base.WETH],
            restrictTokenRatio: 100,
        })
    },
    bsc: {
        tvl: getUniTVL({ factory: ARCHLY_FACTORY_OTHER, seDefaultCoreAssets: true, hasStablePools: true, }),
        staking: sumTokensExport({
            owner: ARCHLY_VE_TOKEN_OTHER,
            tokens: [ARCHLY_ARC_TOKEN_OTHER],
            lps: ['0x3a1c6C7Ced1c14e07385582c5bB82eFBA4df4f19'],
            coreAssets: [ADDRESSES.bsc.WBNB],
            restrictTokenRatio: 100,
        })
    },
    fantom: {
        tvl: getUniTVL({ factory: ARCHLY_FACTORY_OTHER, useDefaultCoreAssets: true, hasStablePools: true, }),
        staking: sumTokensExport({
            owner: ARCHLY_VE_TOKEN_OTHER,
            tokens: [ARCHLY_ARC_TOKEN_OTHER],
            lps: ['0xe962fEF0e7cE6D666359Dab6127f6f8d814aC1a9'],
            coreAssets: [ADDRESSES.fantom.WFTM],
            restrictTokenRatio: 100,
        })
    },
    kava: {
        tvl: getUniTVL({ factory: ARCHLY_FACTORY_OTHER, useDefaultCoreAssets: true, hasStablePools: true, }),
        staking: sumTokensExport({
            owner: ARCHLY_VE_TOKEN_OTHER,
            tokens: [ARCHLY_ARC_TOKEN_OTHER],
            lps: ['0x008C71505A2e110d1FFAA402B01aeb202fb107dB'],
            coreAssets: [ADDRESSES.kava.WKAVA],
            restrictTokenRatio: 100,
        })
    },
    optimism: {
        tvl: getUniTVL({ factory: ARCHLY_FACTORY_OTHER, useDefaultCoreAssets: true, hasStablePools: true, }),
        staking: sumTokensExport({
            owner: ARCHLY_VE_TOKEN_OTHER,
            tokens: [ARCHLY_ARC_TOKEN_OTHER],
            lps: ['0xc492BCa6777818256C2e2e5FC8e180BC8697DfF5'],
            coreAssets: [ADDRESSES.optimism.WETH_1],
            restrictTokenRatio: 100,
        })
    },
    polygon: {
        tvl: getUniTVL({ factory: ARCHLY_FACTORY_OTHER,  useDefaultCoreAssets: true, hasStablePools: true, }),
        staking: sumTokensExport({
            owner: ARCHLY_VE_TOKEN_OTHER,
            tokens: [ARCHLY_ARC_TOKEN_OTHER],
            lps: ['0x2651D7B53BaF1925D28A3b5A3ef371274e630C4C'],
            coreAssets: [ADDRESSES.polygon.WMATIC_2],
            restrictTokenRatio: 100,
        })
    }
}