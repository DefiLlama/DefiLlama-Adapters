const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

// BaibaiCustodian holds all maker capital that backs the on-chain curves
const CUSTODIAN = '0xAaC48FEB93c5C97E0fb3c7C57E1633922A4ACDa3'

module.exports = {
  methodology: 'TVL is the WETH and USDC held by the BaibaiCustodian contract, which custodies the maker liquidity that BaiBai quotes and settles swaps against.',
  start: '2026-09-05',
  base: {
    tvl: sumTokensExport({ owner: CUSTODIAN, tokens: [ADDRESSES.base.WETH, ADDRESSES.base.USDC] }),
  },
}
