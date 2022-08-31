const {uniTvlExport} = require('../helper/calculateUniTvl.js')

module.exports = {
  polygon:{
    tvl: uniTvlExport("0x1d21Db6cde1b18c7E47B0F7F42f4b3F68b9beeC9", "polygon"),
  },
}
