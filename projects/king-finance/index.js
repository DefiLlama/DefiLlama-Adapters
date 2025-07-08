const { staking } = require('../helper/staking')

const POOL2S = '0x66e5388c84da5a30ebe58eeac73bbceb59c9f1ae'

module.exports = {
  bsc: {
    tvl: () => 0,
    staking: staking(POOL2S, '0x74f08aF7528Ffb751e3A435ddD779b5C4565e684'),
  }
}
