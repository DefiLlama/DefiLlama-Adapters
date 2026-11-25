const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

// Every SpineVault is deployed by SpineVaultFactory, which emits SpineVaultCreated. Each vault deploys
// its own BorrowController in its constructor, so the vault list is all that needs to be discovered.
const config = {
  ethereum: { factory: '0xbCbA400103641B25Cc76D27825a9dd252b6586d2', fromBlock: 25766715 },
  monad: { factory: '0x0502D0E22EBA522dD65AA118Bc7605Eb43EccFBE', fromBlock: 101952810 },
  robinhood: { factory: '0x0502D0E22EBA522dD65AA118Bc7605Eb43EccFBE', fromBlock: 60826700 },
}

const abi = {
  vaultCreated: 'event SpineVaultCreated(address indexed spineVaultAddress)',
  borrowConfigs: 'function borrowConfigs(uint256) view returns (address collateralToken, uint32 maturity, uint16 interestRate, uint16 earlyExitPenalty, uint32 gracePeriod, uint256 borrowLimit, uint256 borrowMinAmount, uint256 currentBorrowed)',
  subVaults: 'function subVaults(uint256) view returns (address vault, uint64 weight, bool active)',
}

async function getVaults(api) {
  const { factory, fromBlock } = config[api.chain]
  const logs = await getLogs2({ api, factory, fromBlock, eventAbi: abi.vaultCreated })
  const vaults = logs.map(i => i.spineVaultAddress)
  const [assets, controllers] = await Promise.all([
    api.multiCall({ abi: 'address:asset', calls: vaults }),
    api.multiCall({ abi: 'address:borrowController', calls: vaults }),
  ])
  return { vaults, assets, controllers }
}

async function tvl(api) {
  const { vaults, assets, controllers } = await getVaults(api)
  const subVaults = await api.fetchList({ lengthAbi: 'subVaultsLength', itemAbi: abi.subVaults, calls: vaults, groupedByInput: true })
  // a controller's collateral tokens are the ones its borrow configs (collateral, maturity, rate) reference
  const borrowConfigs = await api.fetchList({ lengthAbi: 'configCount', itemAbi: abi.borrowConfigs, calls: controllers, groupedByInput: true })

  const ownerTokens = []
  vaults.forEach((vault, i) => {
    ownerTokens.push([[assets[i], ...subVaults[i].map(v => v.vault)], vault]) // idle debt token + sub-vault shares
    ownerTokens.push([[...new Set(borrowConfigs[i].map(c => c.collateralToken))], controllers[i]]) // posted collateral
  })
  return sumTokens2({ api, ownerTokens })
}

async function borrowed(api) {
  const { assets, controllers } = await getVaults(api)
  const debts = await api.multiCall({ abi: 'uint256:totalDebt', calls: controllers })
  api.add(assets, debts)
}

module.exports = {
  doublecounted: true,
  methodology: 'Spine vaults are discovered from the SpineVaultFactory SpineVaultCreated events. TVL is each vault\'s idle debt token, its deposits in its ERC-4626 sub-vaults (e.g. Steakhouse USDG on Morpho), and the collateral posted in its borrow controller. Outstanding loans are reported as borrowed.',
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl, borrowed }
})
