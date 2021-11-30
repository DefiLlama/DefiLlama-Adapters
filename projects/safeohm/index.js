const { ohmTvl } = require('../helper/ohm')

const treasury = "0x16d657D5CfD6D7f894BFdB2F5481f8a23bDce269"
module.exports = ohmTvl(treasury, [
    ["0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", false],
    ["0xb2e7793aad96e4e3048e0eb8d091e13a12087a52", true],
   ], "bsc", "0x7C340D53252A5b921754A436Ce3211Ac6E0F267D", "0xBDaa094a95e452c6bA175cE9EdfeFBa04e6a51Ac")