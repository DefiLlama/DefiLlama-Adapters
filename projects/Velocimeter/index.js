const { uniTvlExport } = require('../helper/calculateUniTvl.js')
const { staking } = require('../helper/staking')

module.exports = {
  canto: {
    tvl: uniTvlExport('0xF80909DF0A01ff18e4D37BF682E40519B21Def46', 'canto'),
    staking: staking(
      '0x8E003242406FBa53619769F31606ef2Ed8A65C00',
      '0xB5b060055F0d1eF5174329913ef861bC3aDdF029',
      'canto'
    )
  }
}
