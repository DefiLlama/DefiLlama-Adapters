const { getLogs2 } = require('../helper/cache/getLogs')

// Qiro VaultFactory — deployed 2026-09-11, block 25955076
const FACTORY = '0x92845599127e8fccae5dfceb6c48afbb92e301e2'
const FROM_BLOCK = 25955076

async function getVaults(api) {
  const logs = await getLogs2({
    api,
    factory: FACTORY,
    fromBlock: FROM_BLOCK,
    eventAbi:
      'event VaultDeployed(address indexed vault, address indexed vsm, address indexed rm, address asset, address vaultOwner)',
  })
  return logs.map(i => ({ vault: i.vault, asset: i.asset }))
}

// Stablecoins held by each vault: idle cash, including redemptions not yet claimed
async function tvl(api) {
  const vaults = await getVaults(api)
  return api.sumTokens({ tokensAndOwners: vaults.map(i => [i.asset, i.vault]) })
}

// Capital deployed through each vault's position managers, at their optimistic value
async function borrowed(api) {
  const vaults = await getVaults(api)
  const vsms = await api.multiCall({
    abi: 'address:VAULT_STRATEGY_MANAGER',
    calls: vaults.map(i => i.vault),
  })
  const deployed = await api.multiCall({
    abi: 'uint256:totalOptimisticValue',
    calls: vsms,
  })
  deployed.forEach((bal, i) => { if (bal) api.add(vaults[i].asset, bal) })
}

module.exports = {
  methodology:
    'TVL counts the stablecoins held on-chain by Qiro StakedVaults, enumerated from VaultFactory ' +
    'VaultDeployed logs. Capital deployed to whitelisted subaccounts is no longer held by the protocol ' +
    'and is reported separately as borrowed, at the optimistic value of each vault\'s position managers ' +
    '(VaultStrategyManager totalOptimisticValue), which includes yield accrued but not yet returned to the vault.',
  start: '2026-09-11', // first vault deployment
  ethereum: { tvl, borrowed },
}
