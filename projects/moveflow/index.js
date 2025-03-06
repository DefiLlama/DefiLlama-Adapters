const ADDRESSES = require('../helper/coreAssets.json')

const { function_view, getResource } = require("../helper/chain/aptos");

const { sumTokensExport } = require('./../helper/unwrapLPs')

const USDC =
  ADDRESSES.aptos.USDC_3;
const USDT =
  ADDRESSES.aptos.USDt;
const APT =
  ADDRESSES.aptos.APT;
const MOON =
  ADDRESSES.aptos.MOON;
const CELL =
  ADDRESSES.aptos.CELL;


async function tvl(api) {
  const faData  = 
  await function_view({
      "functionStr": "0x15a5484b9f8369dd3d60c43e4530e7c1bb82eef041bf4cf8a2090399bebde5d4::stream::get_fa_tvl",
      "type_arguments": [],
      "args": []
  });

  console.log("faData",faData);

  let cell_value = 0;
  let usdc_value = 0;
  let usdt_value = 0;
  let apt_value = 0;
  let moon_value = 0;

  faData.map((item, index)=>{
    let assetsTvl = []
    if(index === 1){
      assetsTvl = item;
    }
    assetsTvl.map((item, index)=>{
      if(index === 0){
        cell_value = item
      }
      if(index === 1){
        usdt_value = item
      }
      if(index === 2){
        usdc_value = item
      }
    })
  })
  

  const coinData  = 
  await function_view({
      "functionStr": "0x15a5484b9f8369dd3d60c43e4530e7c1bb82eef041bf4cf8a2090399bebde5d4::stream::get_coin_tvl",
      "type_arguments": [],
      "args": []
  });
  console.log("coinData",coinData);

  coinData.map((item, index)=>{
    let assetsTvl = []
    if(index === 1){
      assetsTvl = item;
    }
    assetsTvl.map((item, index)=>{
      if(index === 0){
        apt_value = item
      }
      if(index === 1){
        moon_value = item
      }
    })
  })

  console.log(USDC, usdc_value);
  console.log(USDT, usdt_value);
  console.log(APT, apt_value);
  console.log(MOON, moon_value);
  console.log(CELL, cell_value);

  api.add(USDC, usdc_value);
  api.add(USDT, usdt_value);
  api.add(APT, apt_value);
  api.add(MOON, moon_value);
  api.add(CELL, cell_value);
}


module.exports = {
    occ: {
        tvl: sumTokensExport({ 
          owners: ['0x408BDA1fe3Ed15Dc6b06a00055a2894e5D79369E'],
          tokens: [ ADDRESSES.occ.WEDU, ADDRESSES.occ.BLEND, ADDRESSES.occ.USDT, ADDRESSES.occ.USDC, ADDRESSES.occ.WETH, ADDRESSES.occ.WBTC],
        }),
    },
    aptos: { tvl },
};