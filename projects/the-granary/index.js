const sdk = require("@defillama/sdk");
const { aaveChainTvl } = require('../helper/aave');

function v2(chain, v2Registry){
  const section = borrowed => sdk.util.sumChainTvls([
    aaveChainTvl(chain, v2Registry, undefined, undefined, borrowed),
  ])
  return {
    tvl: section(false),
    borrowed: section(true)
  }
}

module.exports = {
  fantom: v2("fantom", "0x773E0277667F0c38d3Ca2Cf771b416bfd065da83"),
  avax: v2("avax", "0xC043BA54F34C9fb3a0B45d22e2Ef1f171272Bc9D"),
  optimism: v2("optimism", "0x872B9e8aea5D65Fbf29b8B05bfA4AA3fE94cC11f"),
  ethereum: v2("ethereum", "0x5C93B799D31d3d6a7C977f75FDB88d069565A55b"),
  metis: v2("metis", "0x37133A8dCA96400c249102E59B11e25b0F663Ee0"),
  arbitrum: v2("arbitrum", "0x512f582fFCCF3C14bD872152EeAe60866dCB2A1e"),
  bsc: v2("bsc", "0x7c8E7536c5044E1B3693eB564C6dE3a3CE58bbDa"),
  base:  v2("base", "0x5C93B799D31d3d6a7C977f75FDB88d069565A55b"),
  linea: v2("linea", "0xd539294830EaF5C22467CE6e085Ae4E02861845A"),
}
