const { getLogs } = require('../helper/cache/getLogs')

// jUSD.manager() -> 0x0000000E44A948Ab0c83F2C65D3a2C4A06B05228, Manager.stablesManager() ->
const STABLES_MANAGER = '0x00000000Fb1d443a8D2aAAEE72ce4c55b8dB04B7'
const FROM_BLOCK = 21500000

async function tvl(api) {
  const registryLogs = await getLogs({
    api, target: STABLES_MANAGER, fromBlock: FROM_BLOCK, onlyArgs: true,
    eventAbi: 'event RegistryAdded(address indexed token, address indexed registry)',
  })
  const updatedLogs = await getLogs({
    api, target: STABLES_MANAGER, fromBlock: FROM_BLOCK, onlyArgs: true, extraKey: 'registry-updated',
    eventAbi: 'event RegistryUpdated(address indexed token, address indexed registry)',
  })
  const registries = [...new Set([...registryLogs, ...updatedLogs].map(l => l.registry))]
  const tokens = await api.multiCall({ abi: 'address:token', calls: registries })

  for (let i = 0; i < registries.length; i++) {
    const logs = await getLogs({
      api, target: registries[i], fromBlock: FROM_BLOCK, onlyArgs: true,
      eventAbi: 'event CollateralAdded(address indexed user, uint256 share)',
    })
    const holdings = [...new Set(logs.map(l => l.user))]
    if (!holdings.length) continue
    const collaterals = await api.multiCall({ abi: 'function collateral(address) view returns (uint256)', target: registries[i], calls: holdings })
    api.add(tokens[i], collaterals)
  }
}

module.exports = {
  methodology: 'TVL includes all collateral registered in the protocol',
  ethereum: { tvl },
}
