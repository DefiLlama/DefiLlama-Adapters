const {uniTvlExport} = require('../helper/calculateUniTvl.js')

module.exports = {
  arbitrum:{
    tvl: uniTvlExport("0xF7A23B9A9dCB8d0aff67012565C5844C20C11AFC", "arbitrum"),
  },
}