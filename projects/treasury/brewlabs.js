const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const bscTreasury = "0x5Ac58191F3BBDF6D037C6C6201aDC9F99c93C53A";
const ethTreasury = "0x64961Ffd0d84b2355eC2B5d35B0d8D8825A774dc";
const polygonTreasury = "0x3f0DaF02b9cF0DBa7aeF41C1531450Fda01E8ae9";
const BREWLABS = "0x6aAc56305825f712Fd44599E59f2EdE51d42C3e7";
const ethBREWLABS = "0xdAd33e12e61dC2f2692F2c12e6303B5Ade7277Ba";


module.exports = treasuryExports({
  bsc: {
    tokens: [ 
        nullAddress,
        ADDRESSES.bsc.BUSD,//busd
        ADDRESSES.bsc.WBNB,//wbnb
        ADDRESSES.bsc.USDT,//bsc-usd
        '0x9d7107c8E30617CAdc11f9692A19C82ae8bbA938',//roo
        '0xF14D3692B0055Db9Ca4c04065165d59B87E763f1',//mbc
        '0xe91a8D2c584Ca93C7405F15c22CdFE53C29896E3',//dext
        '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',//cake
     ],
    owners: [bscTreasury],
    ownTokens: [BREWLABS],
  },
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.USDC,
        '0x4FD51Cb87ffEFDF1711112b5Bd8aB682E54988eA',//wpt
        ADDRESSES.ethereum.USDT,
        '0x235C8EE913d93c68D2902a8e0b5a643755705726',//bag
        ADDRESSES.ethereum.WETH,
        '0x9d7107c8E30617CAdc11f9692A19C82ae8bbA938',//roo
        '0x089729b0786C8803cff972c16e402f3344d079eA',//bgpt
     ],
    owners: [ethTreasury],
    ownTokens: [ethBREWLABS],
  },
  polygon: {
    tokens: [ 
        nullAddress,
     ],
    owners: [polygonTreasury],
    ownTokens: [],
  },
})