const { unwrapBalancerToken } = require("../helper/unwrapLPs")

async function tvl(_, _b, _cb, { api, }) {
  const ADMIN_ADDR = '0xd584a5e956106db2fe74d56a0b14a9d64be8dc93'
  const CONFIG_ADDR = await api.call({ abi: 'address:collateralConfig', target: ADMIN_ADDR })
  const collaterals = await api.call({ abi: 'address[]:getAllowedCollaterals', target: CONFIG_ADDR })
  const ACTIVE_POOL = await api.call({ abi: 'address:activePool', target: ADMIN_ADDR })
  const bals = await api.multiCall({ abi: 'function getEntireSystemColl(address) view returns (uint256)', target: ADMIN_ADDR, calls: collaterals })
  api.addTokens(collaterals, bals)
}

async function pool2(_, _b, _cb, { api, }) {
  return unwrapBalancerToken({ ...api, balancerToken: '0xd20f6F1D8a675cDCa155Cb07b5dC9042c467153f', owner: '0x9425b96462b1940e7563cd765464300f6a774805'})
  
}
module.exports = {
  methodology: `TVL is fetched from the Ethos Reserve subgraph and the Byte Masons token price api.`,
  optimism: {
    tvl,
    pool2,
  },
}
