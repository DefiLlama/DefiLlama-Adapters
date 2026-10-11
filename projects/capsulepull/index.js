const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

// CapsuleLend on Robinhood Chain. USDG sits here only while a funded loan
// still holds its principal. The owner can withdraw that principal before
// repayment, and a repayment or default sends the stablecoin out.
const LEND = '0xa7F89DE1FE71Aa4D37A9179231787b2aC1a4DcFc'

module.exports = {
  methodology:
    'TVL is the USDG balance of the CapsuleLend contract on Robinhood Chain. ' +
    'That balance is principal still held by a funded loan. It drops when the owner withdraws the principal, the loan is repaid, or the loan defaults and the stablecoin leaves the contract. ' +
    'The Solana card vault and the Robinhood treasury wallet are not counted.',
  start: 1791718674,
  robinhood: {
    tvl: sumTokensExport({ owners: [LEND], tokens: [ADDRESSES.robinhood.USDG] }),
  },
}
