const { sumTokensExport } = require('../helper/unwrapLPs')

const VAULT = '0xfdeb7e9f59cad080d9158ff850ce79bcf6cdd5f0'
const USDSC = '0x3f99231dD03a9F0E7e3421c92B7b90fbe012985a'

module.exports = {
  methodology: 'TVL is the USDSC held by the Startale Earn vault on Soneium.',
  start: '2025-11-25',
  soneium: { tvl: sumTokensExport({ owner: VAULT, tokens: [USDSC] }) },
}
