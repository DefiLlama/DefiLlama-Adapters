const { ohmTvl } = require('../helper/ohm')

const treasury = "0xF1081555011689cCCfa29CCA6a9E6AFcB907B0bC"
module.exports = ohmTvl(treasury, [
    //BUSD
    ["0xe9e7cea3dedca5984780bafc599bd69add087d56", false],
    //DAI
    ["0xE50c40B0B84946D7491337613059F181700ddBEa", false],
    //pancakeswap LP
    ["0x76129f6e590f7aaac39b9804048a18060297a79b", true],
   ], "bsc", "0x4669A93D251633C9983103529783eD1E4E36F20c", "0x4E141769366634D9c4e498257Fa7EC204d22b634")