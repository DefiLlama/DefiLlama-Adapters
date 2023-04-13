const { dexExport } = require('../helper/chain/aptos')

module.exports = dexExport({
  account: '0xbd35135844473187163ca197ca93b2ab014370587bb0ed3befff9e902d6bb541',
  poolStr: 'amm::Pool',
  token0Reserve: i => i.data.x_reserve.value,
  token1Reserve: i => i.data.y_reserve.value,
})
