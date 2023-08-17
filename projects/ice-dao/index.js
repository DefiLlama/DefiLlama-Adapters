const ADDRESSES = require('../helper/coreAssets.json')
const { ohmTvl } = require("../helper/ohm");

const treasuryAddress = "0x935AEf514141B0CA32849e9686d22CB8b6f1dCAF";
module.exports = ohmTvl(treasuryAddress, [
//MIM
  ["0x130966628846bfd36ff31a822705796e8cb8c18d", false],
//WAVAX
  [ADDRESSES.avax.WAVAX, false],
// ICY MIM JLP
  ["0x453B5415Fe883f15686A5fF2aC6FF35ca6702628", true],
// MEMO
  ["0x136acd46c134e8269052c62a67042d6bdedde3c9", false]

], "avax", "0xBDe1c85C9fAA18bC6e8EDa1e2d813E63f86fd145", "0x78bF833AaE77EBF62C21A9a5A6993A691810F2e1", addr=> {
  if (addr.toLowerCase() === "0x136acd46c134e8269052c62a67042d6bdedde3c9") {
    return "avax:0xb54f16fb19478766a268f172c9480f8da1a7c9c3"
  }
  return `avax:${addr}`
}, undefined, false)