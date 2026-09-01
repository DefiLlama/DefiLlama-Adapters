const ADDRESSES = require('../helper/coreAssets.json')
const { ohmTvl } = require('../helper/ohm')

const treasury = "0x68bb6883B44F4Ab37596b6189FAe354E937D4990"
module.exports = ohmTvl(treasury, [
    ["0x130966628846bfd36ff31a822705796e8cb8c18d", false],//mim
    [ADDRESSES.avax.WAVAX, false],//avax
    ["0xaef85b5b06b13b79b17fd684b1f04035570a9ae0", true],//joeLP
    ["0xe750f3b821d4bc696f977756cd3b1b5e0ae00647", true],//joeLP
   ], "avax", "0x39Af1EB019750aDc3Ea89D80080079F64D5432dB", "0xb80323c7aa915cb960b19b5cca1d88a2132f7bd1")