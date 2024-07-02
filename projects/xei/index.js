const { json } = require('starknet');
const { get } = require('../helper/http');
const { uniV3Export } = require('../helper/uniswapV3');
const { toUSDTBalances } = require('../helper/balances');



const V3Factory = '0x0596a0469D5452F876523487251BDdE73D4B2597';

async function tvl(api) {
  console.log(api.timestamp)
  const res=await get("https://app.xei.finance/indexer/1329/xei/dexTvl?endAt="+api.timestamp.toString())
  const tvl=parseInt(res.data)
 return toUSDTBalances(tvl)
  
  
}

module.exports = {
  methodology:"TVL of LPs",
  sei:{
    tvl
  }
}; 