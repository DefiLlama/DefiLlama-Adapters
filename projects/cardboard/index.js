const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/solana')

const VAULT_AUTHORITY = 'HrW16vpyqURMvR4CeRf1QYMucEGKusHuzPVz1V3h7R7B'

module.exports = {
  timetravel: false,
  methodology: 'TVL is the USDC held by the Cardboard program: house LP funds, trader margin and balances, and fees not yet withdrawn.',
  solana: {
    tvl: sumTokensExport({ owner: VAULT_AUTHORITY, tokens: [ADDRESSES.solana.USDC] }),
  },
}
