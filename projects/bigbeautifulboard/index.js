const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

// Oracle wallet — holds the prize pool (rollover pot + pending payouts)
const ORACLE_WALLET = '0xF1946486A6172087a1AbefFe83Ffc6E4FeAb75F4'

module.exports = {
  methodology: 'TVL is the USDC held in the BBB oracle wallet, representing the active prize pool and rollover pot for the on-chain tile game.',
  start: '2026-02-04',
  base: {
    tvl: sumTokensExport({
      owners: [ORACLE_WALLET],
      tokens: [ADDRESSES.base.USDC],
    }),
  },
}
