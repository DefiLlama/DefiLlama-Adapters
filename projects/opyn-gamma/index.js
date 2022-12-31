const avaxTvl = require('./gamma_avax');
const ethereumTvl = require('./gamma_ethereum');
const polygonTvl = require('./gamma_polygon');


module.exports = {
  ethereum: {
    tvl: ethereumTvl
  },
  avax:{
    tvl: avaxTvl
  },
  polygon: {
    tvl: polygonTvl
  }
}
 