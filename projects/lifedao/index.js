const ADDRESSES = require('../helper/coreAssets.json')
const { ohmTvl } = require('../helper/ohm')

const treasury = "0x1e63a2eB2827db56d3CB1e1FF17ef1040B2d3D3f"
module.exports = ohmTvl(treasury, [
    //MIM
    ["0x130966628846bfd36ff31a822705796e8cb8c18d", false],
    //wAVAX
    [ADDRESSES.avax.WAVAX, false],
    //joe LP 
    ["0xd7cdc2e47ab29a6b651704e39374bb9857f02e02", true],
    //joe LP 
    ["0xdf9abadd06101e4e52128db30b055a7aa78b3537", true],
   ], "avax", "0x3C09c500829D09AfEA7575005fcAFBacFcde6902", "0x5684a087C739A2e845F4AaAaBf4FBd261edc2bE8")