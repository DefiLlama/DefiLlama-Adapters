const { parseDecimal } = require('./balances')
const { queryBankBalance, queryContract, queryNode, queryRawContractState } = require('./query')

async function getBruneBacking(address, height) {
  const [storedState, liquidRune] = await Promise.all([
    queryRawContractState(address, 'state', height),
    queryBankBalance(address, 'rune', height),
  ])
  if (!storedState) throw new Error(`Missing bRUNE state for ${address} at ${height}`)

  const state = JSON.parse(storedState.toString())
  const nodes = await Promise.all(state.nodes.map((node) => queryNode(node, height)))
  const bonded = nodes.reduce((total, node) => {
    const provider = node.bond_providers?.providers?.find(
      ({ bond_address: bondAddress }) => bondAddress === address,
    )
    return total + parseDecimal(provider?.bond || '0')
  }, 0n)

  return {
    liquid: parseDecimal(liquidRune),
    bonded,
    minted: parseDecimal(state.minted),
    pendingRevenue: parseDecimal(state.revenue?.pending || '0'),
  }
}

async function getCreditAccountsPage(address, height, limit) {
  const accounts = []
  let cursor = null
  do {
    const response = await queryContract(address, { all_accounts: { cursor, limit } }, height)
    accounts.push(...response.accounts)
    cursor = response.accounts.length === limit ? response.accounts.at(-1).account : null
  } while (cursor !== null)
  return accounts
}

async function getCreditAccounts(address, height) {
  try {
    return await getCreditAccountsPage(address, height, 100)
  } catch (error) {
    if (!error.message.includes('out of gas')) throw error
    return getCreditAccountsPage(address, height, 10)
  }
}

module.exports = { getBruneBacking, getCreditAccounts }
