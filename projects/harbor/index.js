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
  bsc: v2("bsc", "0x31406A8c12813b64bF9985761BA51412B92fFb4E"),
}
