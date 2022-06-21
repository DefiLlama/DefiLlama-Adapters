
const factory = "0xd654CbF99F2907F06c88399AE123606121247D5C"

const { uniTvlExport } = require('../helper/calculateUniTvl');

module.exports = {
    okexchain: {
      tvl: uniTvlExport(factory, 'okexchain'),
    },
} // node test.js projects/bxh/index.js
