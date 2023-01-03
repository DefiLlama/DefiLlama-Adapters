const { dexExport } = require('../helper/chain/aptos')

module.exports = dexExport({
  account: '0xa5d3ac4d429052674ed38adc62d010e52d7c24ca159194d17ddc196ddb7e480b',
  poolStr: 'pool::Pool',
  token0Reserve: i => i.data.x.value,
  token1Reserve: i => i.data.y.value,
})