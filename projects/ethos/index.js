const { unwrapBalancerToken } = require("../helper/unwrapLPs")

function mergeObjects(...objects) {
  const mergedObject = {};

  for (const obj of objects) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (mergedObject.hasOwnProperty(key)) {
          mergedObject[key] += obj[key];
        } else {
          mergedObject[key] = obj[key];
        }
      }
    }
  }

  return mergedObject;
}

async function tvl(_, _b, _cb, { api, }) {
  const ADMIN_ADDR = '0xd584a5e956106db2fe74d56a0b14a9d64be8dc93'
  const CONFIG_ADDR = await api.call({ abi: 'address:collateralConfig', target: ADMIN_ADDR })
  const collaterals = await api.call({ abi: 'address[]:getAllowedCollaterals', target: CONFIG_ADDR })
  const ACTIVE_POOL = await api.call({ abi: 'address:activePool', target: ADMIN_ADDR })
  const bals = await api.multiCall({ abi: 'function getEntireSystemColl(address) view returns (uint256)', target: ADMIN_ADDR, calls: collaterals })
  const ADMIN_ADDR_V2 = '0x06cbD15D58069193717486CFDe37Ebf5Ec72a8A6'
  const CONFIG_ADDR_V2 = await api.call({ abi: 'address:collateralConfig', target: ADMIN_ADDR_V2 })
  const collateralsV2 = await api.call({ abi: 'address[]:getAllowedCollaterals', target: CONFIG_ADDR_V2 })
  const ACTIVE_POOL_V2 = await api.call({ abi: 'address:activePool', target: ADMIN_ADDR_V2 })
  const balsV2 = await api.multiCall({ abi: 'function getEntireSystemColl(address) view returns (uint256)', target: ADMIN_ADDR_V2, calls: collateralsV2 })
  const ADMIN_ADDR_V2_1 = '0x75C72F459f2054B46ceFD6D10eC99d0fbd777F05'
  const CONFIG_ADDR_V2_1 = await api.call({ abi: 'address:collateralConfig', target: ADMIN_ADDR_V2_1 })
  const collateralsV2_1 = await api.call({ abi: 'address[]:getAllowedCollaterals', target: CONFIG_ADDR_V2_1 })
  const ACTIVE_POOL_V2_1 = await api.call({ abi: 'address:activePool', target: ADMIN_ADDR_V2_1 })
  const balsV2_1 = await api.multiCall({ abi: 'function getEntireSystemColl(address) view returns (uint256)', target: ADMIN_ADDR_V2_1, calls: collateralsV2_1 })
  api.addTokens(collaterals, bals)
  api.addTokens(collateralsV2, balsV2)
  api.addTokens(collateralsV2_1, balsV2_1)
}

async function pool2(_, _b, _cb, { api, }) {
  const stakingPool = await unwrapBalancerToken({ ...api, balancerToken: '0xd20f6F1D8a675cDCa155Cb07b5dC9042c467153f', owner: '0x9425b96462b1940e7563cd765464300f6a774805'})
  const stakingPoolV2 = await unwrapBalancerToken({ ...api, balancerToken: '0xD13D81aF624956327A24d0275CBe54b0eE0E9070', owner: '0x6c56A0Ca937A3C9f29bCF386D3cD0667Ef9d7e88'})
  const stakingPoolV2_1 = await unwrapBalancerToken({ ...api, balancerToken: '0xD13D81aF624956327A24d0275CBe54b0eE0E9070', owner: '0x7D6a62d496D42d5E978C4eDa0d367Ac1Ba70A200'})
  const mergedObject = mergeObjects(stakingPool, stakingPoolV2, stakingPoolV2_1);
  return mergedObject
  
}
module.exports = {
  methodology: `TVL is fetched from the Ethos Reserve subgraph and the Byte Masons token price api.`,
  optimism: {
    tvl,
    pool2,
  },
}
