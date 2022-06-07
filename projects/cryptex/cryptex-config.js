const chainIds = {
    bsc: 56,
    polygon: 137,
    fantom: 250,
    avax: 43114,
    xdai: 100,
    cronos: 25,
    aurora: 1313161554,
    moonriver: 1285,
}

const chainNameById = Object.keys(chainIds).reduce((acc, key) => {
    acc[chainIds[key]] = key;
    return acc;
}, {});

const cryptexConfig = {
    crxToken: "0x97a30C692eCe9C317235d48287d23d358170FC40",
    staking: {
        V1: "0x4Dc421AEc34397b447bA1469bcD2C4185224ceC4",
        V2: "0x2DA458781F0BAf868009deD0512a96989bEaE841"
    },
}

const swaps = {
    // BSC
    pancakeswap: 'pancakeswap',
    pancakeswapv2: 'pancakeswapv2',
    apeswap: 'apeswap',
    leonicornswap: 'leonicornswap',
    knightswap: 'knightswap',
    // FANTOM
    spookyswap: 'spookyswap',
    spiritswap: 'spiritswap',
    darkknightswap: 'darkknightswap',
    bombswap: 'bombswap',
    // avax
    pangolinswap: 'pangolinswap',
    traderjoe: 'traderjoe',
    // XDAI (Gnosis)
    honeyswap: 'honeyswap',
    // AURORA
    auroraswap: 'auroraswap',
    // CRONOS
    cronaswap: 'cronaswap',
    // CROSS-CHAINED
    sushiswap: 'sushiswap',
}

const swapConfigs = {
    [chainIds.bsc]: {
        [swaps.pancakeswap]: {
            key: swaps.pancakeswap,
            factory: '0xBCfCcbde45cE874adCB698cC183deBcF17952812',
        },
        [swaps.pancakeswapv2]: {
            key: swaps.pancakeswapv2,
            factory: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73',
        },
        [swaps.apeswap]: {
            key: swaps.apeswap,
            factory: '0x0841BD0B734E4F5853f0dD8d7Ea041c241fb0Da6',
        },
        [swaps.leonicornswap]: {
            key: swaps.leonicornswap,
            factory: '0xeb10f4fe2a57383215646b4ac0da70f8edc69d4f',
        },
        [swaps.knightswap]: {
            key: swaps.knightswap,
            factory: '0xf0bc2E21a76513aa7CC2730C7A1D6deE0790751f',
        },
    },
    [chainIds.polygon]: {
        [swaps.sushiswap]: {
            key: swaps.sushiswap,
            factory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
        },
        [swaps.quickswap]: {
            key: swaps.quickswap,
            factory: '0x5757371414417b8c6caad45baef941abc7d3ab32',
        },
    },
    [chainIds.xdai]: {
        [swaps.sushiswap]: {
            key: swaps.sushiswap,
            factory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
        },
        [swaps.honeyswap]: {
            key: swaps.honeyswap,
            factory: '0xA818b4F111Ccac7AA31D0BCc0806d64F2E0737D7',
        }
    },
    [chainIds.fantom]: {
        [swaps.spiritswap]: {
            key: swaps.spiritswap,
            factory: '0xEF45d134b73241eDa7703fa787148D9C9F4950b0',
        },
        [swaps.spookyswap]: {
            key: swaps.spookyswap,
            factory: '0x152ee697f2e276fa89e96742e9bb9ab1f2e61be3',
        },
        [swaps.bombswap]: {
            key: swaps.bombswap,
            factory: '0xD9473A05b2edf4f614593bA5D1dBd3021d8e0Ebe',
        },
        [swaps.darkknightswap]: {
            key: swaps.darkknightswap,
            factory: '0x7d82F56ea0820A9d42b01C3C28F1997721732218',
        },
    },
    [chainIds.avax]: {
        [swaps.pangolinswap]: {
            key: swaps.pangolinswap,
            factory: '0xefa94DE7a4656D787667C749f7E1223D71E9FD88',
        },
        [swaps.traderjoe]: {
            key: swaps.traderjoe,
            factory: '0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10',
        },
    },
    [chainIds.cronos]: {
        [swaps.cronaswap]: {
            key: swaps.cronaswap,
            factory: '0x73A48f8f521EB31c55c0e1274dB0898dE599Cb11',
        }
    },
    [chainIds.aurora]: {
        [swaps.auroraswap]: {
            key: swaps.auroraswap,
            factory: '0xC5E1DaeC2ad401eBEBdd3E32516d90Ab251A3aA3',
        }
    },
    [chainIds.moonriver]: {
        [swaps.sushiswap]: {
            key: swaps.sushiswap,
            factory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
        }
    },
}

const chainConfigs = {
    [chainIds.bsc]: {
        vesting: {
            address: '0x0B07f109E7A08Ad41F99d409329851E968AbD231',
            deployBlock: 7134211,
        },
        lockers: [{
            version: 1,
            deployBlock: 5300329,
            address: '0x7f5EF2cE9150ffE2796F62F1177fc6f22a527E5F',
            swaps: [swaps.pancakeswap,],
        },{
            version: 2,
            deployBlock: 6966666,
            address: '0xe0c3ab2c69d8b43d8B0D922aFa224A0AB6780dE1',
            swaps: [swaps.pancakeswapv2,],
        },{
            version: 3,
            deployBlock: 7867793,
            address: '0x6773Be587556ABeb401aa712958879787e9131F9',
            swaps: [swaps.apeswap],
        },{
            version: 3,
            deployBlock: 12561149,
            address: '0x6e28D5c3C1886F6DA95a5eF9F048bccac3aB7E83',
            swaps: [swaps.leonicornswap,],
        },{
            version: 3,
            deployBlock: 13678367,
            address: '0xa134d366110Fcd89ec504AC9c1eB2A1d715a8B9B',
            swaps: [swaps.knightswap,],
        },{
            version: 4,
            deployBlock: 15335372,
            address: '0x3853a94acD9002B1f87eDB9267bef0702b3D9283',
            swaps: [
                swaps.pancakeswapv2,
                swaps.apeswap,
                swaps.leonicornswap,
                swaps.knightswap,
            ],
        }],
    },
    [chainIds.polygon]: {
        vesting: {
            address: '0x5F0D4Ec7293bB95E26Cc4f5bd0D95D39C5c8FD30',
            deployBlock: 16477018,
        },
        lockers: [{
            version: 3,
            deployBlock: 15681470,
            address: '0x698b50D22F6bc422162CaeDF75Ec29635a11A818',
            swaps: [
                swaps.quickswap
            ],
        },{
            version: 3,
            deployBlock: 15680659,
            address: '0xE239138d6d6e3048B05401c226B777Cd0234cD92',
            swaps: [
                swaps.sushiswap
            ],
        },{
            version: 4,
            deployBlock: 25070018,
            address: '0xBbd3660299f34D204d9aDf90acaD445ffACB4897',
            swaps: [
                swaps.quickswap,
                swaps.sushiswap,
            ],
        }]
    },
    [chainIds.xdai]: {
        vesting: {
            address: '0x24fCd667e0C55aa39ebcc3783Dc6d1eb754fa912',
            deployBlock: 17333151,
        },
        lockers: [{
            version: 3,
            deployBlock: 17315872,
            address: '0xeB32a3290aBa8b5e2A5C67A29C8aDd2D2D590614',
            swaps: [
                swaps.sushiswap,
            ],
        },{
            version: 3,
            deployBlock: 17316077,
            address: '0x8847A10864F0fBc309cC852A3e9850351bE4061e',
            swaps: [
                swaps.honeyswap
            ],
        },{
            version: 4,
            deployBlock: 20697471,
            address: '0x17400E59dB1EBc0E12F11D65127d2F97a87709c4',
            swaps: [
                swaps.sushiswap,
                swaps.honeyswap
            ],
        }],
    },
    [chainIds.fantom]: {
        vesting: {
            address: '0xd7BE08609bb6649fF30505c7b9Bb3D892763d0Aa',
            deployBlock: 18279805,
        },
        lockers: [{
            version: 3,
            deployBlock: 23709374,
            address: '0xB9486B932B9C6Dd14941101514f1B2a8224ec1D6',
            swaps: [
                swaps.bombswap,
            ],
        },{
            version: 3,
            deployBlock: 18268821,
            address: '0xE239138d6d6e3048B05401c226B777Cd0234cD92',
            swaps: [
                swaps.spookyswap,
            ],
        },{
            version: 3,
            deployBlock: 18268978,
            address: '0x698b50D22F6bc422162CaeDF75Ec29635a11A818',
            swaps: [
                swaps.spiritswap,
            ],
        },{
            version: 3,
            deployBlock: 25642123,
            address: '0x668Ab0A9a7B46840695a94E0b9E533CFD4fE0e53',
            swaps: [
                swaps.darkknightswap,
            ],
        },{
            version: 4,
            deployBlock: 31298572,
            address: '0x0DB68BEfbfcE88239068FAaA491d4Cb772dA6C7D',
            swaps: [
                swaps.bombswap,
                swaps.spookyswap,
                swaps.spiritswap,
                swaps.darkknightswap,
            ],
        },],
    },
    [chainIds.avax]: {
        vesting: {
            address: '0xFC382EF71f861633e31A866e689d772c1B99780d',
            deployBlock: 5218695,
        },
        lockers: [{
            version: 3,
            deployBlock: 5218223,
            address: '0x942e3012AA6f57dcde038e4206387946Eafb5F4E',
            swaps: [
                swaps.pangolinswap,
            ],
        },{
            version: 4,
            deployBlock: 11063865,
            address: '0x8d993129C4B426E72b23897B13Ce3dB471D1fd2D',
            swaps: [
                swaps.pangolinswap,
                swaps.traderjoe,
            ],
        },],
    },
    [chainIds.aurora]: {
        lockers: [{
            version: 4,
            deployBlock: 59767920,
            address: '0x942e3012AA6f57dcde038e4206387946Eafb5F4E',
            swaps: [
                swaps.auroraswap,
            ],
        },],
    },
    [chainIds.cronos]: {
        lockers: [{
            version: 4,
            deployBlock: 1643406,
            address: '0xE239138d6d6e3048B05401c226B777Cd0234cD92',
            swaps: [
                swaps.cronaswap,
            ],
        },],
    },
    [chainIds.moonriver]: {
        lockers: [{
            version: 4,
            deployBlock: 1509384,
            address: '0xE239138d6d6e3048B05401c226B777Cd0234cD92',
            swaps: [
                swaps.sushiswap,
            ],
        },],
    },
}


module.exports = {
    chainIds,
    chainNameById,
    cryptexConfig,
    swaps,
    swapConfigs,
    chainConfigs,
}