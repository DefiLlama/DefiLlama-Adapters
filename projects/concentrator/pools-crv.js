const REFERENCE_ASSETS = {};
const coins = {};

module.exports = [
    {
        dataIndex: 38,
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
        dataIndex: 72,
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
        dataIndex: 27,
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
        dataIndex: 34,
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
        dataIndex: 38,
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
        dataIndex: 38,
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
        dataIndex: 38,
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
        dataIndex: 38,
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
        dataIndex: 38,
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
        dataIndex: 38,
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
        dataIndex: 38,
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
        dataIndex: 38,
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

];