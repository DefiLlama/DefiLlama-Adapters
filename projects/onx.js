const sdk = require("@defillama/sdk");
const { getEthereumTvlEx, getEthereumStaking, getEthereumPoolTvl, getEthereumBorrows, } = require('./config/onx/ethereum');
const { getFantomTvl } = require('./config/onx/fantom');
const { getPolygonTvl } = require('./config/onx/polygon');
const { getAvalancheTvl } = require('./config/onx/avalanche');

module.exports = {
  timetravel: false,
  doublecounted: true,
  ethereum: {
    tvl: getEthereumTvlEx(),
    staking: getEthereumStaking,
    pool2: getEthereumPoolTvl(),
    borrowed: getEthereumBorrows,
  },
  fantom: {
    tvl: getFantomTvl,
  },
  polygon: {
    tvl: getPolygonTvl,
  },
  avax:{
    tvl: getAvalancheTvl,
  },
};
