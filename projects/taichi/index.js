const ADDRESSES = require('../helper/coreAssets.json')
const { ohmTvl } = require('../helper/ohm')

const treasury = "0xD4b0DC48AB6BD7907E3698A62CCD1DBE2d46d310"
module.exports = {
    hallmarks: [
        [1648765747,"Rug Pull"]
    ],
    deadFrom: 1648765747,
    ...ohmTvl(treasury, [
    //BUSD
    [ADDRESSES.bsc.BUSD, false],
    //WBNB
    [ADDRESSES.bsc.WBNB, false],
    //pancakeswap LP
    ["0x5ef473d91e89c613b3e5138fa8279884bf5b7adf", true],
   ], "bsc", "0xb12Ef3033D5CE0F3f80f3A15dE7E90Cd87a5973e", "0xe49bfc53a195a62d78a941a1967d7b0f83a47c14")
}