const { ohmTvl } = require('../helper/ohm')

const treasury = "0xD4b0DC48AB6BD7907E3698A62CCD1DBE2d46d310"
module.exports = ohmTvl(treasury, [
    //BUSD
    ["0xe9e7cea3dedca5984780bafc599bd69add087d56", false],
    //WBNB
    ["0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", false],
    //pancakeswap LP
    ["0x5ef473d91e89c613b3e5138fa8279884bf5b7adf", true],
   ], "bsc", "0xb12Ef3033D5CE0F3f80f3A15dE7E90Cd87a5973e", "0xe49bfc53a195a62d78a941a1967d7b0f83a47c14")