const ADDRESSES = require('../helper/coreAssets.json')

const ETH = ADDRESSES.null
const RPL = '0xd33526068d116ce69f19a9ee46f0bd304f21a51f'

// Rocket Pool Saturn contract addresses (resolved from RocketStorage 0x1d8f8f00cfa6758d7bE78336684788Fb0ee0Fa46)
const contracts = {
  rocketTokenRETH:       ADDRESSES.ethereum.RETH,
  rocketDepositPool:     '0xCE15294273CFb9D9b628F4D61636623decDF4fdC',
  rocketMinipoolManager: '0xe54B8C641fd96dE5D6747f47C19964c6b824D62C',
  rocketNodeManager:     '0xcf2d76A7499d3acB5A22ce83c027651e8d76e250',
  rocketMegapoolFactory: '0xD5bffeaa9f373B9C367132772FAA0b88e3F0E38b',
  rocketNodeStaking:     '0xedFc7DCaE43fF954577a2875a9D805874490eE3E',
}

const abi = {
  depositPoolGetBalance:   'function getBalance() view returns (uint256)',
  getStakingMinipoolCount: 'function getStakingMinipoolCount() view returns (uint256)',
  getTotalStakedRPL:       'function getTotalStakedRPL() view returns (uint256)',
  getNodeCount:            'function getNodeCount() view returns (uint256)',
  getNodeAt:               'function getNodeAt(uint256) view returns (address)',
  getMegapoolDeployed:     'function getMegapoolDeployed(address) view returns (bool)',
  getExpectedAddress:      'function getExpectedAddress(address) view returns (address)',
  getActiveValidatorCount: 'function getActiveValidatorCount() view returns (uint32)',
  getUserQueuedCapital:    'function getUserQueuedCapital() view returns (uint256)',
  getNodeQueuedBond:       'function getNodeQueuedBond() view returns (uint256)',
}

// Idle ETH: rETH withdrawal reserve + deposit pool awaiting staking
const addIdleEth = async (api) => {
  await api.sumTokens({ tokens: [ETH], owners: [contracts.rocketTokenRETH] })
  const depositPoolBal = await api.call({ target: contracts.rocketDepositPool, abi: abi.depositPoolGetBalance })
  api.add(ETH, depositPoolBal)
}

// Staked ETH in legacy minipools (32 ETH each)
const addLegacyMinipoolEth = async (api) => {
  const count = await api.call({ target: contracts.rocketMinipoolManager, abi: abi.getStakingMinipoolCount })
  api.add(ETH, Number(count) * 32 * 1e18)
}

// Staked ETH in megapools
const addMegapoolEth = async (api) => {
  const nodes = await api.fetchList({ target: contracts.rocketNodeManager, lengthAbi: abi.getNodeCount, itemAbi: abi.getNodeAt })
  const deployed = await api.multiCall({ target: contracts.rocketMegapoolFactory, abi: abi.getMegapoolDeployed, calls: nodes.map(n => ({ params: [n] })) })
  const deployedNodes = nodes.filter((_, i) => deployed[i])
  if (deployedNodes.length === 0) return

  const megapools = await api.multiCall({ target: contracts.rocketMegapoolFactory, abi: abi.getExpectedAddress, calls: deployedNodes.map(n => ({ params: [n] })) })
  
  const [activeCounts, userQueued, nodeQueued] = await Promise.all([
    api.multiCall({ calls: megapools, abi: abi.getActiveValidatorCount }),
    api.multiCall({ calls: megapools, abi: abi.getUserQueuedCapital }),
    api.multiCall({ calls: megapools, abi: abi.getNodeQueuedBond }),
  ])

  megapools.forEach((_, i) => {
    const staked = Number(activeCounts[i]) * 32 * 1e18 - Number(userQueued[i]) - Number(nodeQueued[i])
    if (staked > 0) api.add(ETH, staked)
  })
}

const tvl = async (api) => {
  await addIdleEth(api)
  await addLegacyMinipoolEth(api)
  await addMegapoolEth(api)
}

const staking = async (api) => {
  const totalRPL = await api.call({ target: contracts.rocketNodeStaking, abi: abi.getTotalStakedRPL })
  api.add(RPL, totalRPL)
}

module.exports = {
  methodology: 'TVL = idle ETH (rETH reserve + deposit pool) + staked ETH',
  ethereum: { tvl, staking },
}