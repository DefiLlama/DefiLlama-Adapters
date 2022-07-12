const sdk = require('@defillama/sdk');
const BigNumber = require('bignumber.js');
const v1TVL = require('./convexity');
const v2TVL = require('./gamma');
const v2AvaxTVL = require('./gamma_avax');
const gammaPolygonTVL = require('./gamma_polygon');
const squeethTVL = require('./squeeth');

async function avaxTvl(_, ethBlock, chainBlock) {
  const avaxBalances = await v2AvaxTVL.tvl(_, chainBlock.avax);
  return avaxBalances;
}

module.exports = {
  ethereum: {
    tvl: sdk.util.sumChainTvls([v1TVL.tvl, v2TVL.tvl, squeethTVL.tvl])
  },
  avalanche: {
    tvl: avaxTvl
  },
  polygon: {
    tvl: sdk.util.sumChainTvls([gammaPolygonTVL.tvl])
  },
  hallmarks: [
    [1619493707, "Ribbon launch"],
    [1641855660, "Squeeth launch"]
  ]
}
