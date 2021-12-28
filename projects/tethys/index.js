const {calculateUsdUniTvl} = require('../helper/getUsdUniTvl.js')

const factory = '0x2CdFB20205701FF01689461610C9F321D1d00F80'
const metis = '0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000'
const whitelist = [
  '0x69fdb77064ec5c84FA2F21072973eB28441F43F3', // TETHYS
  '0xEA32A96608495e54156Ae48931A7c20f0dcc1a21', // USDC
  '0xbB06DCA3AE6887fAbF931640f67cab3e3a16F4dC', // USDT
  '0x420000000000000000000000000000000000000A', // WETH
]

module.exports = {
  tvl: calculateUsdUniTvl(factory, 'metis', metis, whitelist, 'metis')
}
