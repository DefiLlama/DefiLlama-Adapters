const REFERENCE_ASSETS = {};
const coins = {};

module.exports = [
    {
        id: 'cvxcrv',
        name: 'cvxcrv',
        coins: [
            coins.crv,
            coins.cvxcrv,
        ],
        addresses: {
            swap: '0x9D0464996170c6B9e75eED71c68B99dDEDf279e8',
            lpToken: '0x9D0464996170c6B9e75eED71c68B99dDEDf279e8'
        }
    },
    {
        id: 'cvxfxs',
        name: 'cvxfxs',
        coins: [
            coins.fxs,
            coins.fxs,
        ],
        addresses: {
            swap: '0xd658A338613198204DCa1143Ac3F01A722b5d94A',
            lpToken: '0xF3A43307DcAFa93275993862Aae628fCB50dC768'
        }
    },

    {
        id: 'steth',
        name: 'steth',
        coins: [
            coins.eth,
            coins.steth,
        ],
        addresses: {
            swap: '0xDC24316b9AE028F1497c275EB9192a3Ea0f67022',
            lpToken: '0x06325440D014e39736583c165C2963BA99fAf14E',
        },
    },

    {
        id: 'frax',
        name: 'frax',
        coins: [
            coins.frax,
            coins.crv3pool
        ],
        addresses: {
            swap: '0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B',
            lpToken: '0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B',
        },
    },

    {
        id: 'tricrypto2',
        name: 'tricrypto2',
        coins: [
            coins.usdt,
            coins.wbtc,
            coins.eth,
        ],
        addresses: {
            swap: '0xD51a44d3FaE010294C616388b506AcdA1bfAAE46',
            lpToken: '0xc4AD29ba4B3c580e6D59105FFf484999997675Ff',
        },
    },

    {
        id: 'crveth',
        name: 'crveth',
        coins: [
            coins.eth,
            coins.crv,
        ],
        addresses: {
            swap: '0x8301AE4fc9c624d1D396cbDAa1ed877821D7C511',
            lpToken: '0xEd4064f376cB8d68F770FB1Ff088a3d0F3FF5c4d',
        },
    },

    {
        id: 'cvxeth',
        name: 'cvxeth',
        coins: [
            coins.eth,
            coins.cvx,
        ],
        addresses: {
            swap: '0xB576491F1E6e5E62f1d8F26062Ee822B40B0E0d4',
            lpToken: '0x3A283D9c08E8b55966afb64C515f5143cf907611',
        },
    },

    {
        id: 'crv3pool',
        name: 'crv3pool',
        coins: [
            coins.dai,
            coins.usdc,
            coins.usdt,
        ],
        addresses: {
            swap: '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7',
            lpToken: '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490',
        },
    },

    {
        id: 'ust-wormhole',
        name: 'ust-wormhole',
        coins: [
            coins.ust,
            coins.crv3pool
        ],
        addresses: {
            swap: '0xCEAF7747579696A2F0bb206a14210e3c9e6fB269',
            lpToken: '0xCEAF7747579696A2F0bb206a14210e3c9e6fB269',
        },
    },

    {
        id: 'rocketpooleth',
        name: 'rocketpooleth',
        coins: [
            coins.rETH,
            coins.wstETH,
        ],
        addresses: {
            swap: '0x447Ddd4960d9fdBF6af9a790560d0AF76795CB08',
            lpToken: '0x447Ddd4960d9fdBF6af9a790560d0AF76795CB08',
        },
    },

    {
        id: 'ren',
        name: 'ren',
        coins: [
            coins.renbtc,
            coins.wbtc
        ],
        addresses: {
            swap: '0x93054188d876f558f4a66B2EF1d97d16eDf0895B',
            lpToken: '0x49849C98ae39Fff122806C06791Fa73784FB3675',
        },
    },

    {
        id: 'pusd',
        name: 'pusd',
        coins: [
            coins.pusd,
            coins.crv3pool
        ],
        addresses: {
            swap: '0x8EE017541375F6Bcd802ba119bdDC94dad6911A1',
            lpToken: '0x8EE017541375F6Bcd802ba119bdDC94dad6911A1',
        },
    },

    {
        id: 'susd',
        name: 'susd',
        coins: [
            coins.dai,
            coins.usdc,
            coins.usdt,
            coins.SUSD
        ],
        addresses: {
            swap: '0xA5407eAE9Ba41422680e2e00537571bcC53efBfD',
            lpToken: '0xC25a3A3b969415c80451098fa907EC722572917F',
        },
    },

    {
        id: 'seth',
        name: 'seth',
        coins: [
            coins.eth,
            coins.seth
        ],
        addresses: {
            swap: '0xc5424b857f758e906013f3555dad202e4bdb4567',
            lpToken: '0xA3D87FffcE63B53E0d54fAa1cc983B7eB0b74A9c',
        },
    },

    {
        id: 'sbtc',
        name: 'sbtc',
        coins: [
            coins.renBTC,
            coins.wbtc,
            coins.sBTC
        ],
        addresses: {
            swap: '0x7fC77b5c7614E1533320Ea6DDc2Eb61fa00A9714',
            lpToken: '0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3',
        },
    },
    {
        id: 'fraxusdc',
        name: 'fraxusdc',
        coins: [
            coins.frax,
            coins.usdc
        ],
        addresses: {
            swap: '0xDcEF968d416a41Cdac0ED8702fAC8128A64241A2',
            lpToken: '0x3175Df0976dFA876431C2E9eE6Bc45b65d3473CC',
        },
    },
];