const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { getV2Reserves, getTvl, getBorrowed, aaveChainTvl } = require('../helper/aave');

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
  fantom: v2("fantom", "0x6D77F7a0e9F8EBE1C0FF2d757FC5a411640309ac"),
  avalanche: v2("avax", "0xC043BA54F34C9fb3a0B45d22e2Ef1f171272Bc9D"),
  optimism: v2("optimism", "0x872B9e8aea5D65Fbf29b8B05bfA4AA3fE94cC11f"),
  harmony: v2("harmony", "0xeb3DF52E0254e22434f044C3b62291919501Ee7D"),
  ethereum: v2("ethereum", "0x5C93B799D31d3d6a7C977f75FDB88d069565A55b"),
}
