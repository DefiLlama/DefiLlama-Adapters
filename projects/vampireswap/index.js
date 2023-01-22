const {uniTvlExport} = require('../helper/calculateUniTvl.js')
const {  stakingPricedLP } = require('../helper/staking.js');

const factory = '0xdf0a0a62995ae821d7a5cf88c4112c395fc41358'

module.exports = {
  fantom:{
    staking: stakingPricedLP("0xa9d452E3CEA2b06d7DBE812A6C3ec81cf52334dD", "0x97058c0B5ff0E0E350e241EBc63b55906a9EADbc", "fantom", "0x8fa291be663a069e6289f844944752cd011ec719", "wrapped-fantom", false),
    tvl:uniTvlExport(factory, 'fantom'),
  },
}