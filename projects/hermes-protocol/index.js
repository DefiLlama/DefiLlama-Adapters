const {uniTvlExport} = require('../helper/calculateUniTvl.js')

module.exports = {
  metis:{
    tvl: uniTvlExport("0x068233C5CEb836F0a5f0Ec57CEAC9cD9fB46509F", "metis"),
  },
}
