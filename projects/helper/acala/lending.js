// Loans.TotalPositions: map Twox64Concat CurrencyId => Position { collateral: Balance, debit: Balance }, read over HTTP JSON-RPC
const sdk = require('@defillama/sdk')
const { getStorageEntries, stripHasher, ScaleReader } = require('../chain/substrate')
const { decodeCurrencyId, currencyName } = require('./currency')
const { transformBalances } = require('../portedTokens')

async function lending(chain) {
  const entries = await getStorageEntries(chain, { pallet: 'Loans', item: 'TotalPositions' })
  const balances = {}

  for (const { rest, value } of entries) {
    const currency = decodeCurrencyId(stripHasher(rest, 'Twox64Concat'))
    const collateral = new ScaleReader(value).u128()
    sdk.util.sumSingleBalance(balances, currencyName(chain, currency), collateral.toString())
  }

  return transformBalances(chain, balances)
}

module.exports = {
  lending
}
