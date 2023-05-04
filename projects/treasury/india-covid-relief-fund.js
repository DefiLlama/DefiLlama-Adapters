const {  nullAddress,treasuryExports } = require("../helper/treasury");

const Treasury = "0x68A99f89E475a078645f4BAC491360aFe255Dff1";
const Treasury_bsc = "0x5C9E5571B17D91e6ACcD4F0c29bBe199Af1f7B09";
const Treasury_btc = "bc1q220k2449fau0pxu9hfn28q3w4k99ep9hwsa5fa";
const Treasury_trx = "TSZMcrQzMLdKrgiMPoe2uQMHLeEpkf2j8E"


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',//usdc
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',//usdt
        '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',//matic
        '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',//mkr
        '0x6810e776880C02933D47DB1b9fc05908e5386b96',//gno
        '0x6B175474E89094C44Da98b954EedeAC495271d0F',//dai
     ],
    owners: [Treasury],
  },
  bsc: {
    tokens: [
        nullAddress,
        '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',//busd
        '0x55d398326f99059fF775485246999027B3197955',//busd usdc
        '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',//wbnb
    ],
    owners: [Treasury_bsc]
  },
  tron: {
    tokens: [
        nullAddress,
        'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
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