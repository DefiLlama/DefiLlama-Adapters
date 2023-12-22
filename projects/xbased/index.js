const { uniTvlExport } = require('../helper/calculateUniTvl.js')

module.exports = {
  misrepresentedTokens: true,
  base: {
    tvl: uniTvlExport("0x7a9ACeB13bc00eEC11460A5D7122793461Da96E0", 'base', true, undefined, { }),
  },
}