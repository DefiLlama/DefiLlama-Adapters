const { sumTokensExport } = require('../helper/unwrapLPs')

const TOKENS = [
  '0x80b5a32E4F032B2a058b4F29EC95EEfEEB87aDcd', // axlUSDC
]

const INVESTMENT_CONTRACT = '0x951d1571C75C519Cc3D09b6B71595C6aCe1c06dB'; // Investment Contract

module.exports = {
  islm: {
    tvl: sumTokensExport({ owner: INVESTMENT_CONTRACT, tokens: TOKENS }),
  },
}