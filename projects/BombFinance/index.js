const {uniTvlExport} = require('../helper/calculateUniTvl.js')

const factory = '0xD9473A05b2edf4f614593bA5D1dBd3021d8e0Ebe'

module.exports = {
  fantom:{
    tvl: uniTvlExport(factory, 'fantom'),
  },
}
