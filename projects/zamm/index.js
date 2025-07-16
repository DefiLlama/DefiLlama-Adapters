const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')

const ZAMM = '0x00000000000008882D72EfA6cCE4B6a40b24C860'

module.exports = {
  methodology: 'Sums the raw wei balance of ETH held in the ZAMM contract.',
  start: '2025-04-27',
  ethereum: { tvl: sumTokensExport({ owner: ZAMM, tokens: [nullAddress]}) },
}
