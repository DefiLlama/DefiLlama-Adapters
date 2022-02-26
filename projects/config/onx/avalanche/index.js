const BigNumber = require('bignumber.js');
const { ZERO, getNetworkTokenTvlUsd, createWeb3 } = require('../utils');
const { polygonRpcUrl } = require('../networks');
const { vaults } = require('./vaults');
const { request, gql } = require("graphql-request");

const web3 = createWeb3(polygonRpcUrl);

const getQuickQuery = (pairAddress) => gql`
  query pairs {
    pairs(where: { id: "${pairAddress}"} ) {
      id
      reserveUSD
      volumeUSD
      totalSupply
      }
    }`
;

const url = 'https://api.thegraph.com/subgraphs/name/traderjoe-xyz/exchange';

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

const getTraderJoePoolPrice = async (vault) => {
  if (!vault.contract.address) {
    return ZERO;
  }

  const data = await getPairsData(vault.contract.address);
  const { reserveUSD, totalSupply } = data;

  return reserveUSD && totalSupply ? new BigNumber(reserveUSD).div(totalSupply).div(1e18) : ZERO;
};

const getAvalancheTvl = async () => {
  return getNetworkTokenTvlUsd(vaults, getTraderJoePoolPrice, web3);
};

module.exports = {
  getAvalancheTvl,
}