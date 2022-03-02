const { ohmTvl } = require("../helper/ohm");

const treasuryAddress = "0x0DEA39519cb8c7c549e321d3020E96f91Ed36Ed3";
module.exports = ohmTvl(treasuryAddress, [
//DAI
  ["0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e", false],
//wFTM
  ["0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83", false],
//SPOOKY LP
  ["0xdf42866dc8fa6a962124b5d9eb8c91fa447f4feb", true] ,
//SPOOKY LP
  ["0x01e7f6506bc3661dc690a0a076ace9d3d0253d92", true]
], "fantom", "0x5d189D8224a9aFBc3eC69bedBe2f6dd89B937E73", "0x8eDDA0107D661E82df660DBa01Ff1D40FA17B70c" , addr=>
    addr.toLowerCase()==="0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e"?"0x6b175474e89094c44da98b954eedeac495271d0f":`fantom:${addr}`
, undefined, false)