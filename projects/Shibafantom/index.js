const {uniTvlExport} = require('../helper/calculateUniTvl.js')

const factory = '0xeAcC845E4db0aB59A326513347a37ed4E999aBD8'

module.exports = {
  fantom:{
    tvl: uniTvlExport(factory, 'fantom'),
  },
}