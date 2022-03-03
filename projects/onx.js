const { getEthereumTvl, getEthereumStaking, getEthereumPoolTvl } = require('./config/onx/ethereum');
const { getFantomTvl } = require('./config/onx/fantom');
const { getPolygonTvl } = require('./config/onx/polygon');
const { getAvalancheTvl } = require('./config/onx/avalanche');

module.exports = {
  timetravel: false,
  doublecounted: true,
  ethereum: {
    tvl: getEthereumTvl,
    staking: getEthereumStaking,
    pool: getEthereumPoolTvl,
  },
  fantom: {
    tvl: getFantomTvl,
  },
  polygon: {
    tvl: getPolygonTvl,
  },
  avalanche: {
    tvl: getAvalancheTvl,
  },
}
