const { ohmTvl } = require('../helper/ohm')

const transforms = {
    "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e": "0x6b175474e89094c44da98b954eedeac495271d0f", // DAI
}

const treasury = "0x6e273a49Ba8F77d03C0CF5a190f226DcA7D46E9F"
module.exports = ohmTvl(treasury, [
    //DAI
    ["0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e", false],
    //spirit LP
    ["0x9026711a2097252a198e6602a052117eaa5f3cab", true],
    //spirit LP 
    ["0x9733f6ac1fb1d750cc28261bbbbf902d239c1e36", true],
   ], 
   "fantom", 
   "0xF5aB479d02336917bA84981fb8C3999147FcC12B", 
   "0x3389492f36642f27F7bF4a7749fb3FC2c8fbB7EE", 
   addr => (transforms[addr.toLowerCase()] ? transforms[addr.toLowerCase()] : `fantom:${addr}`) ,)