const {uniTvlExport} = require('../helper/calculateUniTvl.js')

module.exports = {
  metis:{
    tvl: uniTvlExport("0x633a093C9e94f64500FC8fCBB48e90dd52F6668F", "metis"),
  },
}
