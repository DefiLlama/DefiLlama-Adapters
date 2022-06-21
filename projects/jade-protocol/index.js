const { ohmTvl } = require('../helper/ohm')

const treasury = "0x2841c20F1f4C814b1f212d9198d258D5db98eF7d"
module.exports = ohmTvl(treasury, [
    //WBNB
    ["0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", false],
    //BUSD
    ["0xe9e7cea3dedca5984780bafc599bd69add087d56", false],
    //PancakeLP
    ["0x46503d91d7a41fcbdc250e84cee9d457d082d7b4", true],
   ], "bsc", "0x097d72e1D9bbb8d0263477f9b20bEBF66f243AF4", "0x7ad7242A99F21aa543F9650A56D141C57e4F6081")