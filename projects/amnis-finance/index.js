const { function_view } = require('../helper/chain/aptos')

async function _getAmTotalSupply() {
  return function_view({ functionStr: `0x111ae3e5bc816a5e63c2da97d0aa3886519e0cd5e4b046659fa35796bd11542a::amapt_token::total_supply`, type_arguments: [], args: [] })
}

module.exports = {
  timetravel: false,
  aptos: {
    tvl: async () => {
      const totalSupply = await _getAmTotalSupply()
      return {
        aptos: totalSupply/1e8
      }
    }
  }
}
