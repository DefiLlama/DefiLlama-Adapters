const { uniTvlExport } = require('../helper/calculateUniTvl');

module.exports = {
  heco: {
    tvl: uniTvlExport('0x9f1cd0e59e78f5288e2fcf43030c9010d4f2991d', 'heco'),
  },
  bsc: {
    tvl: uniTvlExport('0x137f34df5bcdb30f5e858fc77cb7ab60f8f7a09a', 'bsc'),
  },
  ethereum: {
    tvl: uniTvlExport('0xa7028337d3da1f04d638cc3b4dd09411486b49ea', 'ethereum'),
  },
}
