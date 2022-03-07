const sdk = require("@defillama/sdk");
const { getEthereumTvl, getEthereumStaking, getEthereumPoolTvl, getEthereumBorrows, getEthereumVautsTvl } = require('./config/onx/ethereum');
const { getFantomTvl } = require('./config/onx/fantom');
const { getPolygonTvl } = require('./config/onx/polygon');
const { getAvalancheTvl } = require('./config/onx/avalanche');

module.exports = {
  timetravel: false,
  doublecounted: true,
  ethereum: {
    tvl: sdk.util.sumChainTvls([getEthereumTvl, getEthereumVautsTvl]),
    staking: getEthereumStaking,
    pool: getEthereumPoolTvl,
    borrows: getEthereumBorrows,
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
