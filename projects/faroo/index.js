const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  methodology: 'Counts WPROS held by the stPROS liquid-staking contract on Pharos. Excludes reserves outside Pharos and other products; stPROS deposited into the Hybrid Vault is not added again.',
  start: '2026-06-29',
  pharos: {
    tvl: sumTokensExport({
      owner: '0x6b0a44c64190279f7034b77c13a566e914fe5ec4',
      tokens: [ADDRESSES.pharos.WPROS],
    }),
  },
}
