const REFERENCE_ASSETS = {};
const coins = {};

module.exports = {
    farmConfig: [
        {
            coins: [
                coins.ctr,
                coins.eth,
            ],
            addresses: {
                gauge: '0x5BC3dD6E6b4E5DD811d558843DA6A1bfBB9c9dCa',
                swap: '0xf2f12B364F614925aB8E2C8BFc606edB9282Ba09',
                lpToken: '0x3f0e7916681452D23Cd36B1281457DA721F2E5dF',
            }
        }
    ],
    vaultConfig: [
        {
            id: 'SUSDFRAXBP3CRV-f',
            name: 'Curve.fi Factory USD Metapool: sUSDFRAXBP',
            coins: [
                coins.SUSD,
                coins.TUSD,
            ],
            addresses: {
                swap: '0xe3c190c57b5959Ae62EfE3B6797058B76bA2f5eF',
                lpToken: '0xe3c190c57b5959Ae62EfE3B6797058B76bA2f5eF'
            }
        },
        {
            id: 'TUSD3CRV-f',
            name: 'Curve.fi Factory USD Metapool: TrueUSD',
            coins: [
                coins.crvFRAX,
                coins.TUSD,
            ],
            addresses: {
                swap: '0xEcd5e75AFb02eFa118AF914515D6521aaBd189F1',
                lpToken: '0xEcd5e75AFb02eFa118AF914515D6521aaBd189F1'
            }
        },
        {
            id: 'silofrax-f',
            name: 'Curve.fi Factory Crypto Pool: SILO/FRAX',
            coins: [
                coins.crvFRAX,
                coins.TUSD,
            ],
            addresses: {
                swap: '0x9a22cdb1ca1cdd2371cd5bb5199564c4e89465eb',
                lpToken: '0x2302aaBe69e6E7A1b0Aa23aAC68fcCB8A4D2B460'
            }
        },
        {
            id: 'TUSDFRAXBP3CRV-f',
            name: 'Curve.fi Factory USD Metapool: TUSDFRAXBP',
            coins: [
                coins.crvFRAX,
                coins.TUSD,
            ],
            addresses: {
                swap: '0x33baeDa08b8afACc4d3d07cf31d49FC1F1f3E893',
                lpToken: '0x33baeDa08b8afACc4d3d07cf31d49FC1F1f3E893'
            }
        },
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
            id: 'ib3crv',
            name: 'ib3crv',
            coins: [
                coins.cyDai,
                coins.cyUSDT,
                coins.cyUSDC,
            ],
            addresses: {
                swap: '0x2dded6da1bf5dbdf597c45fcfaa3194e53ecfeaf',
                lpToken: '0x5282a4eF67D9C33135340fB3289cc1711c13638C'
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


        {
            id: 'mim',
            name: 'mim',
            coins: [
                coins.mim,
                coins.crv3pool
            ],
            addresses: {
                swap: '0x5a6A4D54456819380173272A5E8E9B9904BdF41B',
                lpToken: '0x5a6A4D54456819380173272A5E8E9B9904BdF41B',
            },
        },
        {
            id: 'fpifrax',
            name: 'fpifrax',
            coins: [
                coins.frax,
                coins.fpi
            ],
            addresses: {
                swap: '0xf861483fa7E511fbc37487D91B6FAa803aF5d37c',
                lpToken: '0x4704aB1fb693ce163F7c9D3A31b3FF4eaF797714',
            },
        },

        {
            id: 'alusd',
            name: 'alusd',
            coins: [
                coins.alUSD,
                coins.crv3pool
            ],
            addresses: {
                swap: '0x43b4FdFD4Ff969587185cDB6f0BD875c5Fc83f8c',
                lpToken: '0x43b4FdFD4Ff969587185cDB6f0BD875c5Fc83f8c',
            },
        },

        {
            id: 'Compound',
            name: 'Compound',
            coins: [
                coins.cdai,
                coins.cusdc
            ],
            addresses: {
                swap: '0xA2B47E3D5c44877cca798226B7B8118F9BFb7A56',
                lpToken: '0x845838DF265Dcd2c412A1Dc9e959c7d08537f8a2',
            },
        },

        {
            id: 'dola',
            name: 'dola',
            coins: [
                coins.DOLA,
                coins.crv3pool
            ],
            addresses: {
                swap: '0xAA5A67c256e27A5d80712c51971408db3370927D',
                lpToken: '0xAA5A67c256e27A5d80712c51971408db3370927D',
            },
        },

        {
            id: 'busdv2',
            name: 'busdv2',
            coins: [
                coins.busd,
                coins.crv3pool
            ],
            addresses: {
                swap: '0x4807862AA8b2bF68830e4C8dc86D0e9A998e085a',
                lpToken: '0x4807862AA8b2bF68830e4C8dc86D0e9A998e085a',
            },
        },

        {
            id: 'eursusd',
            name: 'eursusd',
            coins: [
                coins.eth,
                coins.usdc
            ],
            addresses: {
                swap: '0x98a7F18d4E56Cfe84E3D081B40001B3d5bD3eB8B',
                lpToken: '0x3D229E1B4faab62F621eF2F6A610961f7BD7b23B',
            },
        },

        {
            id: 'alETH',
            name: 'alETH',
            coins: [
                coins.eth,
                coins.eth
            ],
            addresses: {
                swap: '0xC4C319E2D4d66CcA4464C0c2B32c9Bd23ebe784e',
                lpToken: '0xC4C319E2D4d66CcA4464C0c2B32c9Bd23ebe784e',
            },
        },

        {
            id: '3eur-pool',
            name: '3eur-pool',
            coins: [
                coins.agEUR,
                coins.eurt,
                coins.EURS
            ],
            addresses: {
                swap: '0xb9446c4Ef5EBE66268dA6700D26f96273DE3d571',
                lpToken: '0xb9446c4Ef5EBE66268dA6700D26f96273DE3d571',
            },
        },

        {
            id: 'lusd',
            name: 'lusd',
            coins: [
                coins.lusd,
                coins.crv3pool,
            ],
            addresses: {
                swap: '0xEd279fDD11cA84bEef15AF5D39BB4d4bEE23F0cA',
                lpToken: '0xEd279fDD11cA84bEef15AF5D39BB4d4bEE23F0cA',
            },
        },

        {
            id: 'd3pool',
            name: 'd3pool',
            coins: [
                coins.frax,
                coins.alUSD,
                coins.fei,
            ],
            addresses: {
                swap: '0xBaaa1F5DbA42C3389bDbc2c9D2dE134F5cD0Dc89',
                lpToken: '0xBaaa1F5DbA42C3389bDbc2c9D2dE134F5cD0Dc89',
            },
        },

        {
            id: 'musd',
            name: 'musd',
            coins: [
                coins.mUSD,
                coins.crv3pool,
            ],
            addresses: {
                swap: '0x8474DdbE98F5aA3179B3B3F5942D724aFcdec9f6',
                lpToken: '0x1AEf73d49Dedc4b1778d0706583995958Dc862e6',
            },
        },

        {
            id: 'tusd',
            name: 'tusd',
            coins: [
                coins.TUSD,
                coins.crv3pool,
            ],
            addresses: {
                swap: '0xecd5e75afb02efa118af914515d6521aabd189f1',
                lpToken: '0xecd5e75afb02efa118af914515d6521aabd189f1',
            },
        },

        {
            id: 'tusdfraxbp',
            name: 'tusdfraxbp',
            coins: [
                coins.TUSD,
                coins.FRAXBP,
            ],
            addresses: {
                swap: '0x33baeDa08b8afACc4d3d07cf31d49FC1F1f3E893',
                lpToken: '0x33baeDa08b8afACc4d3d07cf31d49FC1F1f3E893',
            },
        },

        {
            id: 'silofrax',
            name: 'silofrax',
            coins: [
                coins.SILO,
                coins.frax,
            ],
            addresses: {
                swap: '0x9a22CDB1CA1cdd2371cD5BB5199564C4E89465eb',
                lpToken: '0x2302aaBe69e6E7A1b0Aa23aAC68fcCB8A4D2B460',
            },
        },

        {
            id: 'alusdfraxbp',
            name: 'alusdfraxbp',
            coins: [
                coins.alUSD,
                coins.FRAXBP,
            ],
            addresses: {
                swap: '0xB30dA2376F63De30b42dC055C93fa474F31330A5',
                lpToken: '0xB30dA2376F63De30b42dC055C93fa474F31330A5',
            },
        },

        {
            id: 'busdfraxbp',
            name: 'busdfraxbp',
            coins: [
                coins.busd,
                coins.FRAXBP,
            ],
            addresses: {
                swap: '0x8fdb0bB9365a46B145Db80D0B1C5C5e979C84190',
                lpToken: '0x8fdb0bB9365a46B145Db80D0B1C5C5e979C84190',
            },
        },

        {
            id: 'susdfraxbp',
            name: 'susdfraxbp',
            coins: [
                coins.SUSD,
                coins.FRAXBP,
            ],
            addresses: {
                swap: '0xe3c190c57b5959Ae62EfE3B6797058B76bA2f5eF',
                lpToken: '0xe3c190c57b5959Ae62EfE3B6797058B76bA2f5eF',
            },
        },

        {
            id: 'lusdfraxbp',
            name: 'lusdfraxbp',
            coins: [
                coins.lusd,
                coins.FRAXBP,
            ],
            addresses: {
                swap: '0x497CE58F34605B9944E6b15EcafE6b001206fd25',
                lpToken: '0x497CE58F34605B9944E6b15EcafE6b001206fd25',
            },
        },

        {
            id: 'ETH-pETH',
            name: 'ETH-pETH',
            coins: [
                coins.eth,
                coins.pETH,
            ],
            addresses: {
                swap: '0x9848482da3Ee3076165ce6497eDA906E66bB85C5',
                lpToken: '0x9848482da3Ee3076165ce6497eDA906E66bB85C5',
            },
        },

        {
            id: 'ETH-frxETH',
            name: 'ETH-frxETH',
            coins: [
                coins.eth,
                coins.frxETH,
            ],
            addresses: {
                swap: '0xa1F8A6807c402E4A15ef4EBa36528A3FED24E577',
                lpToken: '0xf43211935C781D5ca1a41d2041F397B8A7366C7A',
            },
        },

        {
            id: 'ETH-cbETH',
            name: 'ETH-cbETH',
            coins: [
                coins.eth,
                coins.cbETH,
            ],
            addresses: {
                swap: '0x5FAE7E604FC3e24fd43A72867ceBaC94c65b404A',
                lpToken: '0x5b6C539b224014A09B3388e51CaAA8e354c959C8',
            },
        },
    ]
} 