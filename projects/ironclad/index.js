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
  mode: v2("mode", "0x5C93B799D31d3d6a7C977f75FDB88d069565A55b"),
}
