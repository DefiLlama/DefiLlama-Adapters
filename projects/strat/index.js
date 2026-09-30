const { get, post } = require('../helper/http')

const REST_URL = 'https://rest-strat-1.anvil.asia-northeast.initia.xyz'
const VIEW_BATCH_URL = `${REST_URL}/initia/move/v1/view/json/batch`
const STRAT_MODULE = '0xd49da8a8c29c1294b98fcb119ae3bdc1cf697ac2b42d63caed608b07941ce111'
const IUSD_METADATA = '0x13bab7c0ed9dd9f4609f7dee7a5f69c99e14eca507f77e088d9b429f77e47b81'
const PAGE_SIZE = 100
const VIEW_BATCH_SIZE = 100

async function getSnapshotOptions() {
  const { block } = await get(`${REST_URL}/cosmos/base/tendermint/v1beta1/blocks/latest`)
  return { headers: { 'x-cosmos-block-height': block.header.height } }
}

function viewRequest(address, moduleName, functionName, args) {
  return {
    address,
    module_name: moduleName,
    function_name: functionName,
    type_args: [],
    args: args.map(JSON.stringify),
  }
}

function coinBalanceRequest(owner) {
  return viewRequest('0x1', 'coin', 'balance', [owner, IUSD_METADATA])
}

async function batchView(requests, options) {
  const results = []

  for (let i = 0; i < requests.length; i += VIEW_BATCH_SIZE) {
    const batch = requests.slice(i, i + VIEW_BATCH_SIZE)
    const { responses } = await post(VIEW_BATCH_URL, { requests: batch }, options)

    if (responses?.length !== batch.length)
      throw new Error('Invalid Strat batch view response')

    results.push(...responses.map(({ data }) => JSON.parse(data)))
  }

  return results
}

async function getResource(moduleName, structName, options) {
  const structTag = `${STRAT_MODULE}::${moduleName}::${structName}`
  const url = `${REST_URL}/initia/move/v1/accounts/${STRAT_MODULE}/resources/by_struct_tag?struct_tag=${encodeURIComponent(structTag)}`
  const { resource } = await get(url, options)

  if (!resource?.move_resource)
    throw new Error(`Missing Strat resource: ${moduleName}::${structName}`)

  return JSON.parse(resource.move_resource).data
}

async function getTableEntries(handle, options) {
  const entries = []
  let paginationKey

  do {
    const query = new URLSearchParams({ 'pagination.limit': PAGE_SIZE })
    if (paginationKey) query.set('pagination.key', paginationKey)

    const response = await get(`${REST_URL}/initia/move/v1/tables/${handle}/entries?${query}`, options)
    entries.push(...response.table_entries)
    paginationKey = response.pagination?.next_key
  } while (paginationKey)

  return entries
}

function getIusdProtocolFees(entries) {
  const entry = entries.find(({ key }) => JSON.parse(key).inner === IUSD_METADATA)
  return entry ? BigInt(JSON.parse(entry.value)) : 0n
}

async function tvl(api) {
  const options = await getSnapshotOptions()
  const [vaultStore, collateralStore, propTradingStore, [propVaultInfo]] = await Promise.all([
    getResource('vault', 'CoinStore', options),
    getResource('order', 'CollateralStore', options),
    getResource('prop_trading', 'ModuleStore', options),
    batchView([viewRequest(STRAT_MODULE, 'prop_vault', 'get_vault_info', [IUSD_METADATA])], options),
  ])

  const [fundingEntries, feeEntries] = await Promise.all([
    getTableEntries(propTradingStore.fundings.handle, options),
    getTableEntries(collateralStore.protocol_fees.handle, options),
  ])
  const fundedUsers = fundingEntries
    .filter(({ value }) => JSON.parse(value).collateral_metadata.inner === IUSD_METADATA)
    .map(({ key }) => JSON.parse(key))
  const accountInfos = await batchView(
    fundedUsers.map(user => viewRequest(STRAT_MODULE, 'prop_trading', 'get_account_info', [user])),
    options
  )
  if (accountInfos.some(({ status, sub_addr, collateral_metadata }) =>
    status !== 2 || !sub_addr || collateral_metadata !== IUSD_METADATA
  )) throw new Error('Invalid Strat funded account response')

  const balanceOwners = [
    vaultStore.extend_ref.self,
    collateralStore.extend_ref.self,
    ...accountInfos.map(({ sub_addr }) => sub_addr),
  ]
  const [vaultBalance, tradingBalance, ...fundedBalances] =
    (await batchView(balanceOwners.map(coinBalanceRequest), options)).map(BigInt)
  const protocolFees = getIusdProtocolFees(feeEntries)

  if (protocolFees > tradingBalance)
    throw new Error('Strat protocol fees exceed the trading balance')

  const tradingCollateral = tradingBalance - protocolFees
  const fundedBalance = fundedBalances.reduce((sum, balance) => sum + balance, 0n)
  const total = vaultBalance
    + BigInt(propVaultInfo.current_balance)
    + tradingCollateral
    + fundedBalance

  api.add(IUSD_METADATA, total.toString())
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is the iUSD held by Strat\'s standard and Prop liquidity vaults, active funded-account subaccounts, and shared trading collateral store, minus accrued withdrawable protocol fees. The trading-store balance captures collateral locked in pending orders and open positions. Assessment-only viUSD, position notional, unrealized PnL, protocol-owned balances, and wrapper claims such as Cabal xSLP are excluded.',
  strat: { tvl },
}
