const TROVE_MANAGER_BEACON_PROXY_ADDRESS = '0x0598Ef47508Ec11a503670Ac3B642AAE8EAEdEFA';

async function tvl(api) {
  const token = await api.call({  abi: 'address:collateralToken', target: TROVE_MANAGER_BEACON_PROXY_ADDRESS})
  return api.sumTokens({ tokens: [token], owner: [TROVE_MANAGER_BEACON_PROXY_ADDRESS] })
}

module.exports = {
  bevm: {
    tvl,
  }
}
