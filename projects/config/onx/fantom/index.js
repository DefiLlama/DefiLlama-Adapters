const tokenAddresses = require('../constant');
const BigNumber = require('bignumber.js');
const UniswapV2PairContractAbi = require('../../../helper/ankr/abis/UniswapV2Pair.json');
const { ZERO, fromWei, createContractObject, getVautsTvl, createWeb3, fetchPriceData } = require('../../../helper/ankr/utils');
const { fantomRpcUrl } = require('../../../helper/ankr/networks');
const { vaults } = require('./vaults');
const { EXCHANGE_TYPE } = require('../vault');
const { request, gql } = require("graphql-request");

const web3 = createWeb3(fantomRpcUrl);

const getBooPrice = async () => {
  const c = createContractObject(tokenAddresses.fantom.usdcBooPair, UniswapV2PairContractAbi, web3);
  return fetchPriceData(c.contract, true, 1e12);
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
  if (!vault.contract.address) {
    return ZERO;
  }
  if (vault.exchangeType == EXCHANGE_TYPE.SPOOKYSWAP) {
    const data = await getPairsData(vault.contract.address);
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