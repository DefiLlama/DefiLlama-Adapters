const tokenAddresses = require('../constant');
const BigNumber = require('bignumber.js');
const { ZERO, fromWei, getVautsTvl, } = require('../../../helper/ankr/utils');
const { vaults } = require('./vaults');
const { EXCHANGE_TYPE } = require('../vault');
const { request, gql } = require("graphql-request");
const sdk = require("@defillama/sdk")


const getBooPrice = async () => {
  return fetchPriceData(tokenAddresses.fantom.usdcBooPair, true, 1e12);
};

const fetchPriceData = async (pairAddress, viceVersa = false, multiplier = 1,) => {
  const { reserve0, reserve1 } = await getReserves(pairAddress);
  const isValid = !new BigNumber(reserve0).eq(ZERO) && !new BigNumber(reserve1).eq(ZERO);

  if (isValid) {
    return (viceVersa
      ? new BigNumber(reserve0).div(new BigNumber(reserve1))
      : new BigNumber(reserve1).div(new BigNumber(reserve0))
    ).times(multiplier);
  } else {
    return ZERO;
  }
};

const getReserves = async (pairAddress) => {
  const { output: { _reserve0, _reserve1, _blockTimestampLast } } = await sdk.api.abi.call({
    chain: 'fantom',
    target: pairAddress,
    abi: 'function getReserves() view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)'
  })
  return { reserve0: _reserve0, reserve1: _reserve1, blockTimestampLast: _blockTimestampLast };
};

const getUniPairQuery = (pairAddress) => gql`
query pairDayDatas {  
   pairDayDatas(first: 1000, skip: 0, orderBy: date, orderDirection: asc, where: {pairAddress: "${pairAddress}"}) {    
       id    
       date    
       dailyVolumeToken0    
       dailyVolumeToken1    
       dailyVolumeUSD    
       reserveUSD
       totalSupply    
       __typename  
   }
}
`;

const url = 'https://api.thegraph.com/subgraphs/name/eerieeight/spookyswap';

const getPairsData = async (pairAddress) => {
  try {
    const result = await request(url, getUniPairQuery(pairAddress));
    const last = result.pairDayDatas.length;
    return result && result.pairDayDatas ? result.pairDayDatas[last - 2] : {};
  } catch (e) {
    console.error(e);
  }

  return {};
};

const getSpookyPoolPrice = async (vault) => {
  if (!vault.pool) {
    return ZERO;
  }
  if (vault.exchangeType == EXCHANGE_TYPE.SPOOKYSWAP) {
    const data = await getPairsData(vault.pool);
    const { reserveUSD, totalSupply } = data;
    const result = totalSupply ? fromWei(new BigNumber(reserveUSD).div(totalSupply)) : ZERO;
    return result;
  } else if (vault.exchangeType == EXCHANGE_TYPE.SPOOKYSWAP_SINGLE) {
    return fromWei(await getBooPrice());
  } else {
    return ZERO;
  }
};

const getFantomTvl = async () => {
  return getVautsTvl(vaults, getSpookyPoolPrice);
};

module.exports = {
  getBooPrice,
  getFantomTvl,
}