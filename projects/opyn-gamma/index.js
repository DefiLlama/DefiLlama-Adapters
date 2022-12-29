const avaxTvl = require('./gamma_avax');
const ethereumTvl = require('./gamma_ethereum');
const polygonTvl = require('./gamma_polygon');

async function getAvaxTvl(_, ethBlock, chainBlock) {
  const avaxBalances = await avaxTvl.tvl(_, chainBlock.avax);
  return avaxBalances;
}

module.exports = {
  ethereum: {
    tvl: ethereumTvl.tvl
  },
  avax:{
    tvl: getAvaxTvl
  },
  polygon: {
    tvl: polygonTvl.tvl
  }
}
 