const ADDRESSES = require('../helper/coreAssets.json')
const {  nullAddress,treasuryExports } = require("../helper/treasury");

const Treasury = "0x68A99f89E475a078645f4BAC491360aFe255Dff1";
const Treasury_bsc = "0x5C9E5571B17D91e6ACcD4F0c29bBe199Af1f7B09";
const Treasury_btc = "bc1q220k2449fau0pxu9hfn28q3w4k99ep9hwsa5fa";
const Treasury_trx = "TSZMcrQzMLdKrgiMPoe2uQMHLeEpkf2j8E"


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.USDC,//usdc
        ADDRESSES.ethereum.USDT,//usdt
        ADDRESSES.ethereum.MATIC,//matic
        ADDRESSES.ethereum.MKR,//mkr
        ADDRESSES.ethereum.GNO,//gno
        ADDRESSES.ethereum.DAI,//dai
     ],
    owners: [Treasury],
  },
  bsc: {
    tokens: [
        nullAddress,
        ADDRESSES.bsc.BUSD,//busd
        ADDRESSES.bsc.USDT,//busd usdc
        ADDRESSES.bsc.WBNB,//wbnb
    ],
    owners: [Treasury_bsc]
  },
  tron: {
    tokens: [
        nullAddress,
        ADDRESSES.tron.USDT,
    ],
    owners: [Treasury_trx]
  },
  bitcoin: {
    tokens: [
        nullAddress,
    ],
    owners: [Treasury_btc]
  }
  //https://cryptorelief.in/transparency
})