const tokenAddresses = require('../constant');
const BigNumber = require('bignumber.js');
const UniswapV2PairContractAbi = require('../abis/UniswapV2Pair.json');
const { ZERO, fromWei, createContractObject, getNetworkTokenTvlUsd, createWeb3 } = require('../utils');
const { fantomRpcUrl } = require('../networks');
const { vaults } = require('./vaults');
const { EXCHANGE_TYPE } = require('../vault');
const { request, gql } = require("graphql-request");

const web3 = createWeb3(fantomRpcUrl);

const getReserves = async (pairContract) => {
  try {
    const { _reserve0, _reserve1, _blockTimestampLast } = await pairContract.methods.getReserves().call();
    return { reserve0: _reserve0, reserve1: _reserve1, blockTimestampLast: _blockTimestampLast };
  } catch {
    return { reserve0: '0', reserve1: '0' };
  }
};

const fetchPriceData = async (
  contract,
  viceVersa = false,
  multiplier = 1,
) => {
  const { reserve0, reserve1 } = await getReserves(contract);
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
    console.log(222, pairAddress);
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

  console.log(111, vault.exchangeType);

  if (vault.exchangeType == EXCHANGE_TYPE.SPOOKYSWAP) {
    const data = await getPairsData(vault.contract.address);
    const { reserveUSD, totalSupply } = data;

    console.log(998, reserveUSD, totalSupply);

    const result = totalSupply ? fromWei(new BigNumber(reserveUSD).div(totalSupply)) : ZERO;
    console.log(999, result.toNumber());
    return result;
  } else if (vault.exchangeType == EXCHANGE_TYPE.SPOOKYSWAP_SINGLE) {
    return fromWei(await getBooPrice());
  } else {
    return ZERO;
  }

  return fromWei(await getBooPrice());
};

const getFantomTvl = async () => {
  return getNetworkTokenTvlUsd(vaults, getSpookyPoolPrice, web3);
};

module.exports = {
  getBooPrice,
  getFantomTvl,
}