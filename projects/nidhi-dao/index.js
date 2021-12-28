const { ohmTvl } = require('../helper/ohm')

const treasury = "0x90515c4ae15B7DF8CCD497e02802d0b832f4e33D"
module.exports = ohmTvl(treasury, [
    //DAI
    ["0x8f3cf7ad23cd3cadbd9735aff958023239c6a063", false],
    //Sushi LP
    ["0x7c9b16d845fe163f464d265193cc2b4ee3fac326", true],
], "polygon", "0x4Eef9cb4D2DA4AB2A76a4477E9d2b07f403f0675", "0x057E0bd9B797f9Eeeb8307B35DbC8c12E534c41E")