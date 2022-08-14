const {uniTvlExport} = require('../helper/calculateUniTvl.js')

module.exports = {
  bsc:{
    tvl: uniTvlExport("0x0EFc2D2D054383462F2cD72eA2526Ef7687E1016", "bsc"),
  },
}
