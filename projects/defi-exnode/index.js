const { get } = require('../helper/http')
const BigNumber = require("bignumber.js");

const API = 'https://dex.exnode.ru/api/portfoliov2/users/tvl'

function tvlByChain(chainId) {
  return async ()=>{
    const resp = await get(API)
    return BigNumber(resp[chainId]||0).toFixed(2)
  }
}
async function fetch() {
  const resp = await get(API)
  return BigNumber(resp.total).toFixed(2);
}
module.exports =
  {
  polygon:{
    fetch:tvlByChain('137')
  },
  ethereum:{
    fetch:tvlByChain('1')
  },
  bsc:{
    fetch:tvlByChain('56')
  },
  optimism:{
    fetch:tvlByChain('10')
  },
  arbitrum:{
    fetch:tvlByChain('42161')
  },
  fantom:{
    fetch:tvlByChain('250')
  },
  avax:{
    fetch:tvlByChain('43114')
  },
  xdai:{
    fetch:tvlByChain('100')
  },
  aurora:{
    fetch:tvlByChain('1313161554')
  },
  fetch
}