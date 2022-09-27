const { uniTvlExport } = require('../helper/calculateUniTvl.js')
module.exports = {
  meter: {
    tvl: uniTvlExport("0xb33dE8C0843F90655ad6249F20B473a627443d21", "meter"),
  },
}
