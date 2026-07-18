const { sumTokensExport } = require('../helper/unwrapLPs')

const wstGBP = '0x57C3571f10767E49C9d7b60feb6c67804783B7aE'
const tGBP = '0x27f6c8289550fCE67f6B50BeD1F519966aFE5287'

module.exports = {
  methodology: 'TVL is the tGBP reserve held by the Ethereum wstGBP contract. wstGBP is a non-rebasing token whose redemption value accrues through an oracle-updated NAV: minting deposits tGBP, while redeeming burns wstGBP and pays tGBP at NAV less the configured redemption fee. Canonically bridged wstGBP on L2s and sidechains is excluded because the corresponding Ethereum wstGBP is locked in bridge escrow and remains backed by the same tGBP reserve.',
  start: '2026-04-10',
  ethereum: {
    tvl: sumTokensExport({ owner: wstGBP, tokens: [tGBP] }),
  },
}
