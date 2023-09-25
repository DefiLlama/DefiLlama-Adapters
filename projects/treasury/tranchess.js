const { nullAddress, treasuryExports } = require("../helper/treasury");
const ADDRESSES = require('../helper/coreAssets.json')

const treasuryETH = "0x1bf019a44a708fbeba7adc79bdad3d0769ff3a7b";
const CHESS = "0xD6123271F980D966B00cA4FCa6C2c021f05e2E73"
const qETH = "0x93ef1Ea305D11A9b2a3EbB9bB4FCc34695292E7d";

//BSC CHAIN

const treasuryBSC = "0x1bf019a44a708fbeba7adc79bdad3d0769ff3a7b";
const CHESSB = "0x20de22029ab63cf9A7Cf5fEB2b737Ca1eE4c82A6"


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.WETH,
        "0x04248AAbca09E9a1a3D5129a7ba05b7F17DE7684",
        "0xC764B55852F8849Ae69923e45ce077A576bF9a8d"
     ],
    owners: [treasuryETH],
    ownTokens: [CHESS, qETH],
  },
  bsc: {
    tokens: [ 
        nullAddress,
        ADDRESSES.bsc.ETH,
        ADDRESSES.bsc.USDC,
        ADDRESSES.bsc.BUSD,
        ADDRESSES.bsc.BTCB
     ],
    owners: [treasuryBSC],
    ownTokens: [CHESSB],
  },
})