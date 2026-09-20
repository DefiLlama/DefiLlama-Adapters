const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const USDC_HOLDERS = [
  '0x0F7a3a8f4Da01637d1202bb5443fcF7F88F99fD2', // AntseedDeposits: buyer prepaid credits
  '0x3652E6B22919bd322A25723B94BB207602E5c8e6', // AntseedStaking: legacy seller stake
]

module.exports = {
  methodology: 'TVL is the USDC deposited by buyers for inference payments plus the legacy USDC stake that remains locked by sellers during Antseed\'s staking migration. Protocol-owned funds and ANTS token staking are excluded.',
  base: {
    tvl: sumTokensExport({ owners: USDC_HOLDERS, tokens: [ADDRESSES.base.USDC] }),
  },
}
