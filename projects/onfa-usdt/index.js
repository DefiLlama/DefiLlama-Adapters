const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  onfa: {
    tvl: sumTokensExport({ owner: '0x2CD63B34B308f379c18852aB294389eE26D6C5FA', tokens: [ADDRESSES.onfa.USDT]})
  }
}
