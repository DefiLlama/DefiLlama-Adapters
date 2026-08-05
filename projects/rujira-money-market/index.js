const {
  addRaw,
  addToApi,
} = require('../rujira/balances')
const { semverAtLeast } = require('../rujira/fin')
const { getCreditAccounts } = require('../rujira/helper')
const {
  getBlock,
  getContracts,
  queryContract,
  queryContractInfo,
  queryRawContractState,
} = require('../rujira/query')

const vaultBalanceCache = new Map()

async function loadVaultBalances(height) {
  const available = {}
  const borrowed = {}
  const vaults = await getContracts(height, 'rujira-ghost-vault')

  await Promise.all(
    vaults.map(async ({ address, version }) => {
      const legacy = !semverAtLeast(version, '1.0.0')
      const [storedConfig, statusResult, contractInfo] = await Promise.all([
        queryRawContractState(address, 'config', height),
        queryContract(address, { status: {} }, height).then(
          (status) => ({ status }),
          (error) => ({ error }),
        ),
        legacy ? queryContractInfo(address, height) : null,
      ])
      const config = storedConfig ? JSON.parse(storedConfig.toString()) : {}
      const denom = legacy ? legacyVaultDenom(contractInfo.label) : config.denom

      // Some addresses entered the registry before their vault-config migration.
      // Until denom exists, their custody is not a live Ghost lending pool.
      if (!denom) return
      if (statusResult.error) throw statusResult.error
      const { status } = statusResult
      const deposits = BigInt(status.deposit_pool.size)
      const debt = BigInt(status.debt_pool.size)
      if (debt > deposits)
        throw new Error(`Ghost vault ${address} has debt greater than lender deposits at ${height}`)
      addRaw(available, denom, deposits - debt)
      addRaw(borrowed, denom, debt)
    }),
  )

  return { available, borrowed }
}

function vaultBalances(height) {
  if (!vaultBalanceCache.has(height)) vaultBalanceCache.set(height, loadVaultBalances(height))
  return vaultBalanceCache.get(height)
}

function legacyVaultDenom(label) {
  // Ghost v0.0.x stored its immutable deployment denom in the contract label.
  const prefix = 'rujira-ghost-vault:'
  if (!label.startsWith(prefix)) throw new Error(`Unexpected legacy Ghost label ${label}`)
  return label.slice(prefix.length)
}

async function creditCollateral(height, balances) {
  const creditContracts = await getContracts(height, 'rujira-ghost-credit')
  for (const { address } of creditContracts) {
    const accounts = await getCreditAccounts(address, height)
    for (const account of accounts) {
      for (const { collateral } of account.collaterals) {
        // Ghost Credit currently accepts secured native coins. Debts are reported
        // by their vaults and are deliberately not added to base TVL here.
        if (!collateral.coin)
          throw new Error(`Unsupported Ghost Credit collateral in account ${account.account}`)
        addRaw(balances, collateral.coin.denom, collateral.coin.amount)
      }
    }
  }
}

async function tvl(api) {
  const height = await getBlock(api)
  const { available } = await vaultBalances(height)
  const balances = { ...available }
  await creditCollateral(height, balances)
  addToApi(api, balances)
}

async function borrowed(api) {
  const height = await getBlock(api)
  const { borrowed: balances } = await vaultBalances(height)
  addToApi(api, balances)
}

module.exports = {
  methodology:
    'Counts Ghost vault liquidity available to withdraw (deposit pool less debt pool) plus secured-asset collateral held in Ghost Credit Accounts. Outstanding vault debt is reported separately as borrowed; vault receipt tokens are excluded.',
  thorchain: { tvl, borrowed },
}
