const CORE_CONTRACTS = {
  base:'0x1522ad0a3250eb0f64e0acfe090ca40949330cc1',
  ethereum:'0x164dd1f4174020642967bea521e56fc776742b49'
}

async function tvl(api) {
  const pools = await api.fetchList({ lengthAbi: 'poolCount', itemAbi: 'poolList', target: CORE_CONTRACTS[api.chain] })
  const collaterals = await api.fetchList({ lengthAbi: 'collateralCount', itemAbi: 'collateralList', target: CORE_CONTRACTS[api.chain] })
  const poolUnderlyings = await api.multiCall({ abi: 'address:asset', calls: pools })
  const collateralUnderlyings = await api.multiCall({ abi: 'address:asset', calls: collaterals })
  return api.sumTokens({ tokensAndOwners2: [[...poolUnderlyings, ...collateralUnderlyings], [...pools, ...collaterals]] })
}

async function borrowed(api) {
  const pools = await api.fetchList({ lengthAbi: 'poolCount', itemAbi: 'poolList', target: CORE_CONTRACTS[api.chain] })
  const poolUnderlyings = await api.multiCall({ abi: 'address:asset', calls: pools })
  const borrowed = await api.multiCall({ abi: 'uint256:totalDebt', calls: pools })
  api.add(poolUnderlyings, borrowed)
}

module.exports = {
  methodology: 'Fetches the list of pools and collaterals from the Core and sums up their balances',
  base: {
    tvl, borrowed
  },
  ethereum: {
    tvl, borrowed
  },
}; 