const { calculateUsdUniTvl } = require('../helper/getUsdUniTvl.js')
const { staking } = require('../helper/staking.js');

const factory = '0x733A9D1585f2d14c77b49d39BC7d7dd14CdA4aa5'
const masterchef = '0xCb80F529724B9620145230A0C866AC2FACBE4e3D'
const ftm = '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83'
const brush = '0x85dec8c4b2680793661bca91a8f129607571863d'
const whitelist = [
  brush,
  '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
  '0x49ac072c793fb9523f0688a0d863aadfbfb5d475',
  '0x321162cd933e2be498cd2267a90534a804051b11'
]

module.exports = {
  misrepresentedTokens: true,
  timetravel: true,
  doublecounted: false,
  fantom:{
    tvl: calculateUsdUniTvl(factory, 'fantom', ftm, whitelist, 'fantom'),
    staking: staking(masterchef, brush, "fantom"),
  }
}