const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");
const helper = require("../helper/utils.js");


const url = 'https://info.yfx.com/Lineapi11/fundDistribution?chain=EVERY&type=ALL&token=ALL';


async function getYFXLiquidity(block, chain) {
  let res = await helper.fetchURL(url);
  if (!res.data) return 0;
  for (let k in res.data){
    if (res[k].name == chain){
      return res[k].value;
    }
  }
  return 0;
}


const bscTvl = async (timestamp, ethBlock, chainBlocks) => {
  return await getYFXLiquidity(1, 'BSC');
};

const hecoTvl = async (timestamp, ethBlock, chainBlocks) => {
  return await getYFXLiquidity(1, 'HECO');
};

const xdaiTvl = async (timestamp, ethBlock, chainBlocks) => {
  return await getYFXLiquidity(1, 'XDAI');
}

const okTvl = async (timestamp, ethBlock, chainBlocks) => {
  return await getYFXLiquidity(1, 'OK');
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
  tvl: sdk.util.sumChainTvls([hecoTvl, bscTvl, xdaiTvl, okTvl]),
};