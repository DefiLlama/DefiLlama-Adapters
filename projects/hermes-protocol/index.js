const {calculateUsdUniTvl} = require('../helper/getUsdUniTvl.js')

const factory = '0x068233C5CEb836F0a5f0Ec57CEAC9cD9fB46509F'
const wmetis = '0x75cb093E4D61d2A2e65D8e0BBb01DE8d89b53481'
const whitelist = [
  '0xEA32A96608495e54156Ae48931A7c20f0dcc1a21', // USDC
  '0xbB06DCA3AE6887fAbF931640f67cab3e3a16F4dC', // USDT
  'wmetis', // WMETIS
]

module.exports = {
  methodology: `Metis tokens, USDC, USDT allocated in LP`,
  misrepresentedTokens: true,
  timetravel: true,
  doublecounted: false,
  metis:{
    tvl: calculateUsdUniTvl(factory, 'metis', wmetis, whitelist, 'metis-token'),
  }
}
