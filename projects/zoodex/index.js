const {uniTvlExport} = require('../helper/calculateUniTvl.js')

const factory = '0x6178C3B21F7cA1adD84c16AD35452c85a85F5df4'

module.exports = {
  fantom:{
    tvl: uniTvlExport(factory, 'fantom'),
  },
}
