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
  eon: v2("eon", "0x7CCE4c055BbC0Da1FeCb09F3d327b125FE19555a"),
}