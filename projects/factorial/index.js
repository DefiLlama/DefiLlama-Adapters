const { call } = require("../helper/chain/ton");
const { get } = require('../helper/http')
const { processTVMSliceReadAddress } = require("./utils");
const ADDRESSES = require("../helper/coreAssets.json");

const factorial_ton = "EQDIKEz2BYLnTRWo5W5a6moZ9PXNtyOVOFF7noi8Ufv3axz_";
const pools = [
  "EQCrEHHG4Ff8TD3PzuH5tFSwHBD3zxeXaosz48jGLebwiiNx", // basic  
  "EQBCXQp2sSTJhvnV6DlBqhTsdNMZc_tJcXQJ5XjoWiy-OAge", // advanced
  "EQA3m4H3vTUOeXGW-o6AEyZxv6i79tR-i1f4XiW588HJoqND", // slp-ton
  "EQAYJdU9JFRcKAwMZv3MqD0QVjBEMGO_4mgwOJtTBOHR22ec", // slp-usdt
];
   

async function tvl(api) { 
  const pools = await get('https://api.factorial.finance/info/pools');

  for(const pool of pools) {
    const pool_data = await call({ target: pool.address, abi: "get_pool_data" })

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
}

async function borrowed(api) {
  const pools = await get('https://api.factorial.finance/info/pools');

  for(const pool of pools) {
    const pool_data = await call({ target: pool.address, abi: "get_pool_data" })

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
}

module.exports = {
  methodology: 'Total amount of assets locked in Factorial pool',
  ton: {
    tvl, borrowed,
  }
}

