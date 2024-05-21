const CORE_CONTRACT = '0x1522ad0a3250eb0f64e0acfe090ca40949330cc1';

async function tvl(api) {
  const pools = await api.fetchList({ lengthAbi: 'poolCount', itemAbi: 'poolList', target: CORE_CONTRACT })
  const collaterals = await api.fetchList({ lengthAbi: 'collateralCount', itemAbi: 'collateralList', target: CORE_CONTRACT })
  const poolUnderlyings = await api.multiCall({ abi: 'address:asset', calls: pools })
  const collateralUnderlyings = await api.multiCall({ abi: 'address:asset', calls: collaterals })
  return api.sumTokens({ tokensAndOwners2: [[...poolUnderlyings, ...collateralUnderlyings], [...pools, ...collaterals]] })
}

async function borrowed(api) {
  const pools = await api.fetchList({ lengthAbi: 'poolCount', itemAbi: 'poolList', target: CORE_CONTRACT })
  const poolUnderlyings = await api.multiCall({ abi: 'address:asset', calls: pools })
  const borrowed = await api.multiCall({ abi: 'uint256:totalDebt', calls: pools })
  api.add(poolUnderlyings, borrowed)
}

module.exports = {
  methodology: 'Fetches the list of pools and collaterals from the Core and sums up their balances',
  start: 14684731,
  base: {
    tvl, borrowed
  }
}; 