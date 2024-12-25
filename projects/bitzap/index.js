
const BigNumber = require("bignumber.js");
const { get } = require("../helper/http");

async function fetchPools() {
  const res = await get('https://api.bitzap.ai/v1/getPools/bitlayer/factory-stable-ng?s=1');
  return res.data.poolData;
}
async function fetchHiddenPools() {
  const res = await get('https://api.bitzap.ai/v1/getHiddenPools');
  return res.data.bitlayer;
}

async function tvl() {
  let tvlUsd = BigNumber(0)
  const pools = await fetchPools()
  const hidPoolIds = await fetchHiddenPools()
  pools.forEach(pool => {
      if(!hidPoolIds.includes(pool.id)){
        tvlUsd = tvlUsd.plus(pool.usdTotal)
      }
  });
  return {tether: tvlUsd.toString()}
}

module.exports = {
  timetravel: false,
  btr:{
    tvl
  } 
}