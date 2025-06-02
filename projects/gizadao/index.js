const ADDRESSES = require('../helper/coreAssets.json')
const { ohmTvl } = require('../helper/ohm')

const transforms = {
    [ADDRESSES.fantom.DAI]: ADDRESSES.ethereum.DAI, // DAI
}

const treasury = "0x6e273a49Ba8F77d03C0CF5a190f226DcA7D46E9F"
module.exports = ohmTvl(treasury, [
    //DAI
    [ADDRESSES.fantom.DAI, false],
    //spirit LP
    ["0x9026711a2097252a198e6602a052117eaa5f3cab", true],
    //spirit LP 
    ["0x9733f6ac1fb1d750cc28261bbbbf902d239c1e36", true],
   ], 
   "fantom", 
   "0xF5aB479d02336917bA84981fb8C3999147FcC12B", 
   "0x3389492f36642f27F7bF4a7749fb3FC2c8fbB7EE", 
   addr => (transforms[addr.toLowerCase()] ? transforms[addr.toLowerCase()] : `fantom:${addr}`) ,)