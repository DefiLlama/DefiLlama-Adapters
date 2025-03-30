const { function_view } = require("../helper/chain/aptos");

const thalaswapLensAddress = "0xeeadd07bb5e307ea3b3fb312bea4d1876526e63b9d00c3d09acca6d3744eecea";
const chunkSize = 30;

async function getPools(lensAddress, start, limit) {
  return function_view({ functionStr: `${lensAddress}::lens::get_pools_paginated`, args: [start, limit], chain: 'aptos'})
}

module.exports = {
  timetravel: false,
  methodology:
    "Aggregates TVL in all pools in Thalaswap, Thala Labs' AMM.",
  aptos: {
    tvl: async (api) => {
      let currStart = 0;
      let poolInfos = [];
      while (true) {
        console.log(`Getting pools from ${currStart} to ${currStart + chunkSize}`)
        const pools = await getPools(thalaswapLensAddress, currStart, currStart + chunkSize)
        if (pools.length < chunkSize) {
          break;
        }
        poolInfos.push(...pools);
        currStart += chunkSize;
      }
      console.log(`Found ${poolInfos.length} pools`)
      
      for (const poolInfo of poolInfos) {
        const assets = poolInfo.assets_metadata.map(asset => asset.inner)
        const balances = poolInfo.balances
        api.add(assets, balances)
      }
    },
  },
};