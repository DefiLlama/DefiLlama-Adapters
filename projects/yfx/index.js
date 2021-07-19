const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");
const helper = require("../helper/utils.js");

const usdtNum = 1000000;
const usdt = '0xdac17f958d2ee523a2206206994597c13d831ec7';
const url = 'https://info.yfx.com/Lineapi/fundDistribution?chain=EVERY&type=ALL&token=ALL';


async function getYFXLiquidity(block, chain) {
  let res = await helper.fetchURL(url);
  try{
    if (!res.data.data) return 0;
  }
  catch(e){
      return 0;
  }
  res = res.data.data;
  for (let k in res){
    if (res[k].name == chain){
      return res[k].value;
    }
  }
  return 0;
}


const bscTvl = async (timestamp, ethBlock, chainBlocks) => {
  let res = {};
  res[usdt] = await getYFXLiquidity(1, 'BSC')*usdtNum;
  return res;
};

const hecoTvl = async (timestamp, ethBlock, chainBlocks) => {
  let res = {};
  res[usdt] = await getYFXLiquidity(1, 'HECO')*usdtNum;
  return res;
};

const xdaiTvl = async (timestamp, ethBlock, chainBlocks) => {
  let res = {};
  res[usdt] = await getYFXLiquidity(1, 'XDAI')*usdtNum;
  return res;
}

const okTvl = async (timestamp, ethBlock, chainBlocks) => {
  let res = {};
  res[usdt] = await getYFXLiquidity(1, 'OK')*usdtNum;
  return res;
}

const totalTvl = async (timestamp, ethBlock, chainBlocks) => {
  let total = 0;
  total +=  (await bscTvl(1,1,1))[usdt];
  total +=  (await hecoTvl(1,1,1))[usdt];
  total +=  (await okTvl(1,1,1))[usdt];
  total +=  (await xdaiTvl(1,1,1))[usdt];
  let res = {}
  res[usdt] = total;
  return res;
}

module.exports = {
  bsc: {
    tvl: bscTvl,
  },
  heco: {
    tvl: hecoTvl,
  },
  xdai:{
    tvl: xdaiTvl,
  },
  ok: {
    tvl: okTvl,
  },
  tvl: totalTvl,
};
