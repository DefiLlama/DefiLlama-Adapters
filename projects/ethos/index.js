const { unwrapBalancerToken } = require("../helper/unwrapLPs")

const admins = {
  v1: '0xd584a5e956106db2fe74d56a0b14a9d64be8dc93',
  v2: '0x06cbD15D58069193717486CFDe37Ebf5Ec72a8A6',
  v2_1: '0x75C72F459f2054B46ceFD6D10eC99d0fbd777F05',
}

async function tvl(_, _b, _cb, { api, }) {
  const vaults = Object.values(admins)
  const configs = await api.multiCall({ abi: 'address:collateralConfig', calls: vaults })
  const collaterals = await api.multiCall({ abi: 'address[]:getAllowedCollaterals', calls: configs })
  const pools = await api.multiCall({ abi: 'address:activePool', calls: vaults })
  return api.sumTokens({ ownerTokens: pools.map((p, i) => [collaterals[i], p]) })
  // const calls = vaults.map((target, i) => collaterals[i].map(params => ({ params, target }))).flat()
  // const bals = await api.multiCall({ abi: 'function getEntireSystemColl(address) view returns (uint256)', calls })
  // const tokens = calls.map(i => i.params)
  // api.addTokens(tokens, bals)
}

async function pool2(_, _b, _cb, { api, }) {
  const toa = [
    ['0xd20f6F1D8a675cDCa155Cb07b5dC9042c467153f', '0x9425b96462b1940e7563cd765464300f6a774805'],
    ['0xD13D81aF624956327A24d0275CBe54b0eE0E9070', '0x6c56A0Ca937A3C9f29bCF386D3cD0667Ef9d7e88'],
    ['0xD13D81aF624956327A24d0275CBe54b0eE0E9070', '0x7D6a62d496D42d5E978C4eDa0d367Ac1Ba70A200'],
  ]
  return api.sumTokens({ tokensAndOwners: toa })
  // await Promise.all(toa.map(async ([balancerToken, owner]) => unwrapBalancerToken({ api, balancerToken, owner })))
}
module.exports = {
  methodology: `TVL is fetched from the Ethos Reserve subgraph and the Byte Masons token price api.`,
  optimism: {
    tvl,
    pool2,
  },
}
