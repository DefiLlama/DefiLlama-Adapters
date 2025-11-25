const sui = require('../helper/chain/sui')

const tvl = async (api) => {
  const obj = await sui.getObject('0x2d914e23d82fedef1b5f56a32d5c64bdcc3087ccfea2b4d6ea51a71f587840e5')
  const totalSuiSupply = +obj.fields.validator_pool.fields.total_sui_supply
  api.add('0x2::sui::SUI', totalSuiSupply)
}

module.exports = {
  sui: { tvl }
}