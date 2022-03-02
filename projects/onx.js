const { getEthereumStaking, getEthereumTvl } = require('./config/onx/ethereum');
const { getFantomTvl } = require('./config/onx/fantom');
const { getPolygonTvl } = require('./config/onx/polygon');
const { getAvalancheTvl } = require('./config/onx/avalanche');

module.exports = {
  timetravel: false,
  doublecounted: true,
  ethereum: {
    staking: getEthereumStaking,
    tvl: getEthereumTvl,
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
