const BigNumber = require('bignumber.js');
const { ZERO, getVautsTvl, } = require('../../../helper/ankr/utils');
const { vaults } = require('./vaults');
const { request, gql } = require("graphql-request");

const getQuickQuery = (pairAddress) => gql`
  query pairs {
    pairs(where: { id: "${pairAddress}"} ) {
        id
        reserveUSD
        trackedReserveETH
        volumeUSD
        untrackedVolumeUSD
        totalSupply
      }
    }`
;

const url = 'https://polygon.furadao.org/subgraphs/name/quickswap';

const getPairsData = async (pairAddress) => {
  try {
    const result = await request(url, getQuickQuery(pairAddress));
    const last = result.pairs.length;
    return result && result.pairs ? result.pairs[last - 1] : {};
  } catch (e) {
    console.error(e);
  }

  return {};
};

const getQuickPoolPrice = async (vault) => {
  if (!vault.pool) {
    return ZERO;
  }

  const data = await getPairsData(vault.pool);
  const { reserveUSD, totalSupply } = data;

  return reserveUSD && totalSupply ? new BigNumber(reserveUSD).div(totalSupply).div(1e18) : ZERO;
};

const getPolygonTvl = async () => {
  return getVautsTvl(vaults, getQuickPoolPrice);
};

module.exports = {
  getPolygonTvl,
}