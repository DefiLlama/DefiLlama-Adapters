const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');

module.exports = {
  bsc: {
    tvl: sumTokensExport({ owners: [
      '0xAD1a38cEc043e70E83a3eC30443dB285ED10D774'
    ], tokens: [ADDRESSES.bsc.USDT]})
  },
  methodology: `TVL (Total Value Locked) refers to the total value of all collateral tokens held in the Conditional Token contract, including all collateral tokens provided to OPINION prediction markets`
}