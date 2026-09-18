const { getLogs2 } = require('../helper/cache/getLogs')

const vaultCreatedEvent = 'event VaultCreated(address indexed vault, address indexed owner, address hooks, (string name, string symbol) erc20Params, (address feeCalculator, address feeToken, address feeRecipient) feeVaultParams, address beforeTransferHook, string description)'

const versionAbi = 'string:version'
const getVaultValueAbi = 'function getVaultValueAtLastUpdate(address vault) view returns (uint256)'
const vaultStateAbi = 'function getVaultState(address vault) external view returns ((bool paused, uint8 maxPriceAge, uint16 minUpdateIntervalMinutes, uint16 maxPriceToleranceRatio, uint16 minPriceToleranceRatio, uint8 maxUpdateDelayDays, uint32 timestamp, uint24 accrualLag, uint128 unitPrice, uint128 highestPrice, uint128 lastTotalSupply))'

const factories = {
  ethereum: {
    address: '0x29722cC9a1cACff4a15914F9bC274B46F3b90B4F',
    fromBlock: 22583788,
  },
  base: {
    address: '0x29722cC9a1cACff4a15914F9bC274B46F3b90B4F',
    fromBlock: 30834355,
  },
  morph: {
    address: '0xA735FaF51AE8BD0637b8468828dC83E2C24A8E60',
    fromBlock: 24054994,
  },
  arbitrum: {
    address: '0xd1883062629157Ff6Eae51ca355aCA4f52d2BD4E',
    fromBlock: 378204768,
  },
  optimism: {
    address: '0xd1883062629157Ff6Eae51ca355aCA4f52d2BD4E',
    fromBlock: 141019964,
  },
}

async function getMultiDepositorVaults(api) {
  const factory = factories[api.chain]
  // Some Base RPCs trail the indexed head by a few blocks. Keep the factory
  // log query behind the reported head so provider failover remains reliable.
  const toBlock = api.chain === 'base' ? (await api.getBlock()) - 10 : undefined
  const logs = await getLogs2({
    api,
    target: factory.address,
    eventAbi: vaultCreatedEvent,
    fromBlock: factory.fromBlock,
    toBlock,
  })

  return logs.map(log => log.vault)
}

async function tvl(api) {
  const vaults = await getMultiDepositorVaults(api)
  if (!vaults.length) return

  const feeCalculators = await api.multiCall({ abi: 'address:feeCalculator', calls: vaults })
  const numeraires = await api.multiCall({ abi: 'address:NUMERAIRE', calls: feeCalculators })

  const versions = await api.multiCall({ abi: versionAbi, calls: feeCalculators, permitFailure: true })
  const current = [], legacy = []
  versions.forEach((v, i) => (v == null ? legacy : current).push(i))

  // Current calculators report the last-updated net asset value directly.
  const currentValues = await api.multiCall({ abi: getVaultValueAbi, calls: current.map(i => ({ target: feeCalculators[i], params: [vaults[i]] })) })
  current.forEach((i, j) => api.add(numeraires[i], currentValues[j]))

  // Legacy calculators: NAV = totalSupply * unitPrice / 10**decimals
  const [supplies, decimals, states] = await Promise.all([
    api.multiCall({ abi: 'uint256:totalSupply', calls: legacy.map(i => vaults[i]) }),
    api.multiCall({ abi: 'uint8:decimals', calls: legacy.map(i => vaults[i]) }),
    api.multiCall({ abi: vaultStateAbi, calls: legacy.map(i => ({ target: feeCalculators[i], params: [vaults[i]] })) }),
  ])
  legacy.forEach((i, j) => {
    const value = BigInt(supplies[j]) * BigInt(states[j].unitPrice) / (10n ** BigInt(decimals[j]))
    api.add(numeraires[i], value.toString())
  })
}

module.exports = {
  methodology: 'Counts the last reported net asset value of all Aera V3 multi-depositor vaults created by the protocol factories.',
  start: '2025-05-28',
  ethereum: { tvl },
  base: { tvl },
  morph: { tvl },
  arbitrum: { tvl },
  optimism: { tvl },
}
