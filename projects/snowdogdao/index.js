const ADDRESSES = require('../helper/coreAssets.json')
const { ohmTvl } = require('../helper/ohm')

module.exports.hallmarks=[
    [1637798400,"Rug Pull"]
],
module.exports=ohmTvl("0xC0E7DA06e56727F3B55B24F58e9503FdaAfb2a68", [
    //mim
    ["0x130966628846bfd36ff31a822705796e8cb8c18d", false],
    //wavax
    [ADDRESSES.avax.WAVAX, false],
    //spell
    ["0xce1bffbd5374dac86a2893119683f4911a2f7814", false],
    //joe
    [ADDRESSES.avax.JOE, false],
    //weth
    [ADDRESSES.avax.WETH_e, false],
    //LP_sdog_mim
    ["0xa3f1f5076499ec37d5bb095551f85ab5a344bb58", true]
], "avax", "0xc970dab38627bc7Ba1487754d832A327E0e626Cd", "0xde9e52f1838951e4d2bb6c59723b003c353979b6")