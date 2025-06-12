const abi = require('./abi.json');
const { aaveExports } = require('../helper/aave');

function v2(v2Registry) {
  abi.getAllATokens = abi.getAllOTokens
  return aaveExports('', v2Registry, undefined, undefined, { abis: abi })
}

module.exports = {
  telos: v2("0xb84171C0824B4F3C0B415706C99A4A8ED5779b75"),
  meter: v2("0x64Be9ee529E555860DA0705819138F41247e76E6"),
  fuse: v2("0xbdD3d2f93cc1c6C951342C42Ef0795323CE83719"),
  taiko: v2("0x8Cf3E0e7aE4eB82237d0931388EA72D5649D76e0"),
  tara: v2("0x96a52CdFE64749C146E13F68641073566275433e"),
}