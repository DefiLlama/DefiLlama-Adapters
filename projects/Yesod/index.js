//YesodCoin in swappering
const { sumTokensExport, sumTokens } = require('../helper/unwrapLPs')

const YESOD_TOKEN_CONTRACT = '0x31a6971292504ccf8310b5F9242BA7751c2a8A74'
const YESOD = [
  'YSDT',
]

module.exports = {
  methodology: 'Swaps in generalisation exported',
  kava: {
    tvl: sumTokensExport({ YESOD_TOKEN_CONTRACT, YESOD })
  }
}