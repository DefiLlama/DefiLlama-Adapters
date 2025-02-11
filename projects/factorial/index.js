const { call } = require("../helper/chain/ton");
const { processTVMSliceReadAddress } = require("./utils");
const ADDRESSES = require("../helper/coreAssets.json");
const { methodology } = require('../helper/aave')

const factorial_ton = "EQDIKEz2BYLnTRWo5W5a6moZ9PXNtyOVOFF7noi8Ufv3axz_";
const market_main = "EQCrEHHG4Ff8TD3PzuH5tFSwHBD3zxeXaosz48jGLebwiiNx"

async function tvl(api) { 
  const pool_data = await call({ target: market_main, abi: "get_pool_data" })

  const _kv = 1;
  const assetDicIdx = 13;
  const supplyAmountIdx = 4;
  const borrowAmountIdx = 5;
  const addressIdx = 15;

  const assets = pool_data[assetDicIdx][_kv]["elements"];

  assets.forEach((asset) => {
    const assetInfo = asset["tuple"]["elements"];
    const supplied = assetInfo[supplyAmountIdx]["number"]["number"]; 
    const borrowed = assetInfo[borrowAmountIdx]["number"]["number"]; 
    const address = assetInfo[addressIdx]["slice"]["bytes"];

    const assetAddress = processTVMSliceReadAddress(address);
    const addressToAdd = assetAddress === factorial_ton ? ADDRESSES.ton.TON : assetAddress;
    
    api.add(addressToAdd, supplied - borrowed);
  });
}

async function borrowed(api) {
  const pool_data = await call({ target: market_main, abi: "get_pool_data" })

  const _kv = 1;
  const assetDicIdx = 13;
  const borrowAmountIdx = 5;
  const addressIdx = 15;

  const assets = pool_data[assetDicIdx][_kv]["elements"];

  assets.forEach((asset) => {
    const assetInfo = asset["tuple"]["elements"];
    const borrowed = assetInfo[borrowAmountIdx]["number"]["number"]; 
    const address = assetInfo[addressIdx]["slice"]["bytes"];

    const assetAddress = processTVMSliceReadAddress(address);
    const addressToAdd = assetAddress === factorial_ton ? ADDRESSES.ton.TON : assetAddress;
    
    api.add(addressToAdd, borrowed);
  });
}

module.exports = {
  methodology,
  timetravel: false,
  ton: {
    tvl, borrowed,
  }
}
