const { methodology, aaveExports } = require('../helper/aave');

function v2(v2Registry) {
  return aaveExports('', v2Registry)
}

module.exports = {
  methodology,
  fantom: v2("0x773E0277667F0c38d3Ca2Cf771b416bfd065da83"),
  avax: v2("0xC043BA54F34C9fb3a0B45d22e2Ef1f171272Bc9D"),
  optimism: v2("0x872B9e8aea5D65Fbf29b8B05bfA4AA3fE94cC11f"),
  ethereum: v2("0x5C93B799D31d3d6a7C977f75FDB88d069565A55b"),
  metis: v2("0x37133A8dCA96400c249102E59B11e25b0F663Ee0"),
  arbitrum: v2("0x512f582fFCCF3C14bD872152EeAe60866dCB2A1e"),
  bsc: v2("0x7c8E7536c5044E1B3693eB564C6dE3a3CE58bbDa"),
  base: v2("0x5C93B799D31d3d6a7C977f75FDB88d069565A55b"),
  // linea: v2("0xd539294830EaF5C22467CE6e085Ae4E02861845A"),
}
