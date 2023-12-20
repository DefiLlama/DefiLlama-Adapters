const ADDRESSES = require('../helper/coreAssets.json')
const { getUniTVL, sumTokensExport } = require('../helper/unknownTokens')

const ARCHLY_V2_FACTORY = "0x12508dd9108Abab2c5fD8fC6E4984E46a3CF7824"
const ARCHLY_V2_VE_TOKEN = "0x6ACa098fa93DAD7A872F6dcb989F8b4A3aFC3342"
const ARCHLY_V2_ARC_TOKEN = "0xe8876189A80B2079D8C0a7867e46c50361D972c1"

module.exports = {
    telos: {
        tvl: getUniTVL({ factory: ARCHLY_V2_FACTORY,  useDefaultCoreAssets: true, hasStablePools: true, }),
        staking: sumTokensExport({
            owner: ARCHLY_V2_VE_TOKEN,
            tokens: [ARCHLY_V2_ARC_TOKEN],
            lps: ['0xe7F2AED9670933eDdc71634aAC0A13a187D4fE8f'],
            coreAssets: [ADDRESSES.telos.WTLOS],
            restrictTokenRatio: 100,
        })
    },
    arbitrum: {
        tvl: getUniTVL({ factory: ARCHLY_V2_FACTORY,useDefaultCoreAssets: true, hasStablePools: true, }),
        staking: sumTokensExport({
            owner: ARCHLY_V2_VE_TOKEN,
            tokens: [ARCHLY_V2_ARC_TOKEN],
            lps: ['0x1e99d0c1f55cC082badD0E42B41C0Cfa31F99aD3'],
            coreAssets: [ADDRESSES.arbitrum.WETH],
            restrictTokenRatio: 100,
        })
    },
    arbitrum_nova: {
        tvl: getUniTVL({ factory: ARCHLY_V2_FACTORY, useDefaultCoreAssets: true, hasStablePools: true, }),
        staking: sumTokensExport({
            owner: ARCHLY_V2_VE_TOKEN,
            tokens: [ARCHLY_V2_ARC_TOKEN],
            lps: ['0x66a185f87A7bc337E38eA988fc8DEcf2F35a28d1'],
            coreAssets: [ADDRESSES.arbitrum_nova.WETH],
            restrictTokenRatio: 100,
        })
    },
    base: {
        tvl: getUniTVL({ factory: ARCHLY_V2_FACTORY, seDefaultCoreAssets: true, hasStablePools: true, }),
        staking: sumTokensExport({
            owner: ARCHLY_V2_VE_TOKEN,
            tokens: [ARCHLY_V2_ARC_TOKEN],
            lps: ['0x577B2E4C7Ddd23d2fA9D56b4456505e420851046'],
            coreAssets: [ADDRESSES.base.WETH],
            restrictTokenRatio: 100,
        })
    },
    bsc: {
        tvl: getUniTVL({ factory: ARCHLY_V2_FACTORY, seDefaultCoreAssets: true, hasStablePools: true, }),
        staking: sumTokensExport({
            owner: ARCHLY_V2_VE_TOKEN,
            tokens: [ARCHLY_V2_ARC_TOKEN],
            lps: ['0xf53aFC5c5D5eE21DC68350AbF8eAb6A4d8e6E186'],
            coreAssets: [ADDRESSES.bsc.WBNB],
            restrictTokenRatio: 100,
        })
    },
    fantom: {
        tvl: getUniTVL({ factory: ARCHLY_V2_FACTORY, useDefaultCoreAssets: true, hasStablePools: true, }),
        staking: sumTokensExport({
            owner: ARCHLY_V2_VE_TOKEN,
            tokens: [ARCHLY_V2_ARC_TOKEN],
            lps: ['0x263677110c07Ec272f8b1fe08a473700e6777eDd'],
            coreAssets: [ADDRESSES.fantom.WFTM],
            restrictTokenRatio: 100,
        })
    },
    kava: {
        tvl: getUniTVL({ factory: ARCHLY_V2_FACTORY, useDefaultCoreAssets: true, hasStablePools: true, }),
        staking: sumTokensExport({
            owner: ARCHLY_V2_VE_TOKEN,
            tokens: [ARCHLY_V2_ARC_TOKEN],
            lps: ['0x90e267b0bF52F9993d32DfAB9A415e2B00A870d0'],
            coreAssets: [ADDRESSES.kava.WKAVA],
            restrictTokenRatio: 100,
        })
    },
    optimism: {
        tvl: getUniTVL({ factory: ARCHLY_V2_FACTORY, useDefaultCoreAssets: true, hasStablePools: true, }),
        staking: sumTokensExport({
            owner: ARCHLY_V2_VE_TOKEN,
            tokens: [ARCHLY_V2_ARC_TOKEN],
            lps: ['0x577B2E4C7Ddd23d2fA9D56b4456505e420851046'],
            coreAssets: [ADDRESSES.tombchain.FTM],
            restrictTokenRatio: 100,
        })
    },
    polygon: {
        tvl: getUniTVL({ factory: ARCHLY_V2_FACTORY,  useDefaultCoreAssets: true, hasStablePools: true, }),
        staking: sumTokensExport({
            owner: ARCHLY_V2_VE_TOKEN,
            tokens: [ARCHLY_V2_ARC_TOKEN],
            lps: ['0xc01d8ee3A405f758a3bD9f8cA253F00B9EDec2be'],
            coreAssets: [ADDRESSES.polygon.WMATIC_2],
            restrictTokenRatio: 100,
        })
    }
}