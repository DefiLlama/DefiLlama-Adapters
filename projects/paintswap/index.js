const {calculateUsdUniTvl} = require('../helper/getUsdUniTvl.js')

const factory = '0x733A9D1585f2d14c77b49d39BC7d7dd14CdA4aa5'
const ftm = '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83'
const whitelist = [
  '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
  '0x85dec8c4b2680793661bca91a8f129607571863d',
  '0x49ac072c793fb9523f0688a0d863aadfbfb5d475',
  '0x321162cd933e2be498cd2267a90534a804051b11'
]

module.exports = {
  tvl: calculateUsdUniTvl(factory, 'fantom', ftm, whitelist, 'fantom')
}